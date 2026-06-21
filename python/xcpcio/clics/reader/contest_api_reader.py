"""
Contest API Reader

A reader that implements BaseContestReader interface, fetching data via HTTP API
instead of local files. This is useful for live contests where data is served
by a CLICS-compliant API (e.g., DOMjudge).
"""

import asyncio
import logging
from collections import defaultdict
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from xcpcio.clics.base.types import FileAttr, Image
from xcpcio.clics.clics_api_client import APICredentials, ClicsApiClient, ClicsApiConfig
from xcpcio.clics.reader.interface import BaseContestReader

logger = logging.getLogger(__name__)


class ContestApiReader(BaseContestReader):
    """
    A reader that fetches contest data from a CLICS API.

    This reader implements the same interface as ContestPackageReader but fetches
    data via HTTP instead of reading from local files. It only fetches board-relevant
    data (contest, teams, problems, submissions, judgements, etc.) and skips
    file downloads (photos, logos, statements) and event-feed.
    """

    def __init__(
        self,
        base_url: str,
        contest_id: str,
        credentials: Optional[APICredentials] = None,
        timeout: int = 30,
        max_concurrent: int = 10,
    ):
        """
        Initialize the API reader.

        Args:
            base_url: Base URL of the CLICS API (e.g., "https://domjudge.example.com/api")
            contest_id: Contest ID to fetch data for
            credentials: Optional API credentials (username/password or token)
            timeout: Request timeout in seconds
            max_concurrent: Maximum concurrent requests
        """
        self._base_url = base_url
        self._contest_id = contest_id
        self._credentials = credentials or APICredentials()
        self._timeout = timeout
        self._max_concurrent = max_concurrent

        # Initialize data caches
        self._init_caches()

    def _init_caches(self):
        """Initialize all data caches to empty values."""
        self.access: Dict[str, Any] = {}
        self.api_info: Dict[str, Any] = {}

        self.contest: Dict[str, Any] = {}
        self.contest_state: Dict[str, Any] = {}

        self.accounts: List[Dict[str, Any]] = []
        self.accounts_by_id: Dict[str, Dict[str, Any]] = {}

        self.awards: List[Dict[str, Any]] = []
        self.awards_by_id: Dict[str, Dict[str, Any]] = {}

        self.clarifications: List[Dict[str, Any]] = []
        self.clarifications_by_id: Dict[str, Dict[str, Any]] = {}

        self.groups: List[Dict[str, Any]] = []
        self.groups_by_id: Dict[str, Dict[str, Any]] = {}

        self.judgement_types: List[Dict[str, Any]] = []
        self.judgement_types_by_id: Dict[str, Dict[str, Any]] = {}

        self.judgements: List[Dict[str, Any]] = []
        self.judgements_by_id: Dict[str, Dict[str, Any]] = {}
        self.judgements_by_submission_id: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

        self.languages: List[Dict[str, Any]] = []
        self.languages_by_id: Dict[str, Dict[str, Any]] = {}

        self.organizations: List[Dict[str, Any]] = []
        self.organizations_by_id: Dict[str, Dict[str, Any]] = {}

        self.problems: List[Dict[str, Any]] = []
        self.problems_by_id: Dict[str, Dict[str, Any]] = {}

        self.runs: List[Dict[str, Any]] = []
        self.runs_by_id: Dict[str, Dict[str, Any]] = {}
        self.runs_by_judgement_id: Dict[str, List[Dict[str, Any]]] = defaultdict(list)

        self.submissions: List[Dict[str, Any]] = []
        self.submissions_by_id: Dict[str, Dict[str, Any]] = {}

        self.teams: List[Dict[str, Any]] = []
        self.teams_by_id: Dict[str, Dict[str, Any]] = {}

        # Event feed is not loaded via API reader
        self.event_feed: List[Dict[str, Any]] = []
        self.event_feed_tokens: List[str] = []

    def _create_index_by_id(self, data: List[Dict[str, Any]], id_name: str) -> Dict[str, List[Dict]]:
        """Create an index mapping id_name values to list of items."""
        res: Dict[str, List[Dict]] = defaultdict(list)
        for item in data:
            res[item[id_name]].append(item)
        return res

    def _build_indexes(self):
        """Build all indexes from loaded data."""
        self.accounts_by_id = {account["id"]: account for account in self.accounts}
        self.awards_by_id = {award["id"]: award for award in self.awards}
        self.clarifications_by_id = {clarification["id"]: clarification for clarification in self.clarifications}
        self.groups_by_id = {group["id"]: group for group in self.groups}
        self.judgement_types_by_id = {jt["id"]: jt for jt in self.judgement_types}
        self.judgements_by_id = {judgement["id"]: judgement for judgement in self.judgements}
        self.judgements_by_submission_id = self._create_index_by_id(self.judgements, "submission_id")
        self.languages_by_id = {language["id"]: language for language in self.languages}
        self.organizations_by_id = {org["id"]: org for org in self.organizations}
        self.problems_by_id = {problem["id"]: problem for problem in self.problems}
        self.runs_by_id = {run["id"]: run for run in self.runs}
        self.runs_by_judgement_id = self._create_index_by_id(self.runs, "judgement_id")
        self.submissions_by_id = {submission["id"]: submission for submission in self.submissions}
        self.teams_by_id = {team["id"]: team for team in self.teams}

    async def load_data(self):
        """
        Fetch all data from API and build indexes.

        This method should be called before using any get_* methods.
        It fetches only board-relevant data in parallel for efficiency.
        """
        config = ClicsApiConfig(
            base_url=self._base_url,
            credentials=self._credentials,
            timeout=self._timeout,
            max_concurrent=self._max_concurrent,
        )

        async with ClicsApiClient(config) as client:
            # Fetch API info first
            self.api_info = await client.fetch_api_info() or {}

            # Fetch all board-relevant data in parallel
            results = await asyncio.gather(
                client.fetch_json(f"contests/{self._contest_id}"),
                client.fetch_json(f"contests/{self._contest_id}/state"),
                client.fetch_json(f"contests/{self._contest_id}/problems"),
                client.fetch_json(f"contests/{self._contest_id}/teams"),
                client.fetch_json(f"contests/{self._contest_id}/organizations"),
                client.fetch_json(f"contests/{self._contest_id}/groups"),
                client.fetch_json(f"contests/{self._contest_id}/submissions"),
                client.fetch_json(f"contests/{self._contest_id}/judgements"),
                client.fetch_json(f"contests/{self._contest_id}/judgement-types"),
                return_exceptions=True,
            )

            # Unpack results with error handling
            self.contest = results[0] if isinstance(results[0], dict) else {}
            self.contest_state = results[1] if isinstance(results[1], dict) else {}
            self.problems = results[2] if isinstance(results[2], list) else []
            self.teams = results[3] if isinstance(results[3], list) else []
            self.organizations = results[4] if isinstance(results[4], list) else []
            self.groups = results[5] if isinstance(results[5], list) else []
            self.submissions = results[6] if isinstance(results[6], list) else []
            self.judgements = results[7] if isinstance(results[7], list) else []
            self.judgement_types = results[8] if isinstance(results[8], list) else []

            # Build indexes
            self._build_indexes()

            logger.info(
                f"Loaded data from API. "
                f"[contest_id={self._contest_id}] "
                f"[teams={len(self.teams)}] "
                f"[submissions={len(self.submissions)}] "
                f"[judgements={len(self.judgements)}]"
            )

    # API Information
    def get_api_info(self) -> Dict[str, Any]:
        return self.api_info

    def get_access(self) -> Dict[str, Any]:
        return self.access

    # Account operations (not fetched, return empty)
    def get_accounts(self) -> List[Dict[str, Any]]:
        return self.accounts

    def get_account(self, account_id: str) -> Dict[str, Any]:
        if account_id not in self.accounts_by_id:
            raise HTTPException(status_code=404, detail=f"Account {account_id} not found")
        return self.accounts_by_id[account_id]

    # Contest operations
    def get_contest_id(self) -> str:
        return self._contest_id

    def get_contest(self) -> Dict[str, Any]:
        return self.contest

    def get_contest_state(self) -> Dict[str, Any]:
        return self.contest_state

    def get_contest_banner(self) -> FileAttr:
        raise HTTPException(status_code=501, detail="File operations not supported in API reader")

    def get_contest_problemset(self) -> FileAttr:
        raise HTTPException(status_code=501, detail="File operations not supported in API reader")

    # Problem operations
    def get_problems(self) -> List[Dict[str, Any]]:
        return self.problems

    def get_problem(self, problem_id: str) -> Dict[str, Any]:
        if problem_id not in self.problems_by_id:
            raise HTTPException(status_code=404, detail=f"Problem {problem_id} not found")
        return self.problems_by_id[problem_id]

    def get_problem_statement(self, problem_id: str) -> FileAttr:
        raise HTTPException(status_code=501, detail="File operations not supported in API reader")

    # Team operations
    def get_teams(self) -> List[Dict[str, Any]]:
        return self.teams

    def get_team(self, team_id: str) -> Dict[str, Any]:
        if team_id not in self.teams_by_id:
            raise HTTPException(status_code=404, detail=f"Team {team_id} not found")
        return self.teams_by_id[team_id]

    def get_team_photo(self, team_id: str) -> FileAttr:
        raise HTTPException(status_code=501, detail="File operations not supported in API reader")

    # Organization operations
    def get_organizations(self) -> List[Dict[str, Any]]:
        return self.organizations

    def get_organization(self, organization_id: str) -> Dict[str, Any]:
        if organization_id not in self.organizations_by_id:
            raise HTTPException(status_code=404, detail=f"Organization {organization_id} not found")
        return self.organizations_by_id[organization_id]

    def get_organization_logo(self, organization_id: str) -> FileAttr:
        raise HTTPException(status_code=501, detail="File operations not supported in API reader")

    def get_organization_logo_image(self, organization_id: str) -> Optional[Image]:
        # Not supported in API reader
        return None

    # Group operations
    def get_groups(self) -> List[Dict[str, Any]]:
        return self.groups

    def get_group(self, group_id: str) -> Dict[str, Any]:
        if group_id not in self.groups_by_id:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
        return self.groups_by_id[group_id]

    # Language operations (not fetched, return empty)
    def get_languages(self) -> List[Dict[str, Any]]:
        return self.languages

    def get_language(self, language_id: str) -> Dict[str, Any]:
        if language_id not in self.languages_by_id:
            raise HTTPException(status_code=404, detail=f"Language {language_id} not found")
        return self.languages_by_id[language_id]

    # Judgement type operations
    def get_judgement_types(self) -> List[Dict[str, Any]]:
        return self.judgement_types

    def get_judgement_type(self, judgement_type_id: str) -> Dict[str, Any]:
        if judgement_type_id not in self.judgement_types_by_id:
            raise HTTPException(status_code=404, detail=f"Judgement type {judgement_type_id} not found")
        return self.judgement_types_by_id[judgement_type_id]

    # Submission operations
    def get_submissions(self) -> List[Dict[str, Any]]:
        return self.submissions

    def get_submission(self, submission_id: str) -> Dict[str, Any]:
        if submission_id not in self.submissions_by_id:
            raise HTTPException(status_code=404, detail=f"Submission {submission_id} not found")
        return self.submissions_by_id[submission_id]

    def get_submission_file(self, submission_id: str) -> FileAttr:
        raise HTTPException(status_code=501, detail="File operations not supported in API reader")

    # Judgement operations
    def get_judgements(self, submission_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if submission_id is not None:
            if submission_id not in self.judgements_by_submission_id:
                raise HTTPException(status_code=404, detail=f"Submission id not found: {submission_id}")
            return self.judgements_by_submission_id[submission_id]
        return self.judgements

    def get_judgement(self, judgement_id: str) -> Dict[str, Any]:
        if judgement_id not in self.judgements_by_id:
            raise HTTPException(status_code=404, detail=f"Judgement {judgement_id} not found")
        return self.judgements_by_id[judgement_id]

    # Run operations (not fetched, return empty)
    def get_runs(self, judgement_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if judgement_id is not None:
            if judgement_id not in self.runs_by_judgement_id:
                raise HTTPException(status_code=404, detail=f"Judgement id not found: {judgement_id}")
            return self.runs_by_judgement_id[judgement_id]
        return self.runs

    def get_run(self, run_id: str) -> Dict[str, Any]:
        if run_id not in self.runs_by_id:
            raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
        return self.runs_by_id[run_id]

    # Clarification operations (not fetched, return empty)
    def get_clarifications(self) -> List[Dict[str, Any]]:
        return self.clarifications

    def get_clarification(self, clarification_id: str) -> Dict[str, Any]:
        if clarification_id not in self.clarifications_by_id:
            raise HTTPException(status_code=404, detail=f"Clarification {clarification_id} not found")
        return self.clarifications_by_id[clarification_id]

    # Award operations (not fetched, return empty)
    def get_awards(self) -> List[Dict[str, Any]]:
        return self.awards

    def get_award(self, award_id: str) -> Dict[str, Any]:
        if award_id not in self.awards_by_id:
            raise HTTPException(status_code=404, detail=f"Award {award_id} not found")
        return self.awards_by_id[award_id]

    # Event Feed operations (not supported in API reader)
    def get_event_feed(self, since_token: Optional[str] = None) -> List[Dict[str, Any]]:
        # Event feed is not loaded via API reader
        return []
