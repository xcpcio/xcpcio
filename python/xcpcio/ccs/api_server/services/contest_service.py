"""
Contest Service

Business logic layer for Contest API operations.
Handles file reading, data validation, and business operations.
"""

import bisect
import json
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from fastapi import HTTPException


class ContestService:
    """Service class for contest-related operations"""

    def __init__(self, contest_package_dir: Path):
        """
        Initialize the contest service.

        Args:
            contest_package_dir: Path to the contest package directory
        """
        self.contest_package_dir = contest_package_dir
        if not self.contest_package_dir.exists():
            raise ValueError(f"Contest package directory does not exist: {contest_package_dir}")

        # Initialize data indexes for faster lookups
        self._load_indexes()

    def _create_index_by_id(self, data: List[Dict[str, Any]], id_name: str) -> Dict[str, List[Dict]]:
        res = defaultdict(list)
        for item in data:
            res[item[id_name]].append(item)
        return res

    def _load_indexes(self) -> None:
        """Load and index commonly accessed data for faster lookups"""
        self.access = self.load_json_file("access.json")

        self.accounts = self.load_json_file("accounts.json")
        self.accounts_by_id = {account["id"] for account in self.accounts}

        self.api_info = self.load_json_file("api.json")

        self.awards = self.load_json_file("awards.json")
        self.awards_by_id = {award["id"] for award in self.awards}

        self.clarifications = self.load_json_file("clarifications.json")
        self.clarifications_by_id = {clarification["id"] for clarification in self.clarifications}

        self.contest = self.load_json_file("contest.json")
        self.contest_state = self.load_json_file("state.json")

        self.groups = self.load_json_file("groups.json")
        self.groups_by_id = {group["id"]: group for group in self.groups}

        self.judgement_types = self.load_json_file("judgement-types.json")
        self.judgement_types_by_id = {judgement_type["id"] for judgement_type in self.judgement_types}

        self.judgements = self.load_json_file("judgements.json")
        self.judgements_by_id = {judgement["id"] for judgement in self.judgements}
        self.judgements_by_submission_id = self._create_index_by_id(self.judgements, "submission_id")

        self.languages = self.load_json_file("languages.json")
        self.languages_by_id = {language["id"] for language in self.languages}

        self.organizations = self.load_json_file("organizations.json")
        self.organizations_by_id = {org["id"]: org for org in self.organizations}

        self.problems = self.load_json_file("problems.json")
        self.problems_by_id = {problem["id"]: problem for problem in self.problems}

        self.runs = self.load_json_file("runs.json")
        self.runs_by_id = {run["id"] for run in self.runs}
        self.runs_by_judgement_id = self._create_index_by_id(self.runs, "judgement_id")

        self.submissions = self.load_json_file("submissions.json")
        self.submissions_by_id = {submission["id"]: submission for submission in self.submissions}

        self.teams = self.load_json_file("teams.json")
        self.teams_by_id = {team["id"]: team for team in self.teams}

        self.event_feed = self.load_ndjson_file("event-feed.ndjson")
        self.event_feed_tokens = [event["token"] for event in self.event_feed]

    def load_json_file(self, filepath: str) -> Union[Dict[str, Any], List[Any]]:
        """
        Load JSON data from contest package directory.

        Args:
            filepath: Relative path to JSON file within contest package

        Returns:
            Parsed JSON data

        Raises:
            HTTPException: If file not found or invalid JSON
        """

        full_path = self.contest_package_dir / filepath
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"File not found: {filepath}")
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON in file {filepath}: {e}")

    def load_ndjson_file(self, filepath: str) -> List[Dict[str, Any]]:
        full_path = self.contest_package_dir / filepath
        try:
            data = list()
            with open(full_path, "r", encoding="utf-8") as f:
                for line in f.readlines():
                    data.append(json.loads(line))
            return data
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"File not found: {filepath}")
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON in file {filepath}: {e}")

    def get_contest_id(self) -> str:
        """
        Get contest ID from contest.json.

        Returns:
            Contest ID string
        """
        contest_data = self.load_json_file("contest.json")
        return contest_data.get("id", "unknown")

    def validate_contest_id(self, contest_id: str) -> None:
        """
        Validate that the provided contest ID matches the expected one.

        Args:
            contest_id: Contest ID to validate

        Raises:
            HTTPException: If contest ID doesn't match
        """
        expected_id = self.get_contest_id()
        if contest_id != expected_id:
            raise HTTPException(status_code=404, detail=f"Contest {contest_id} not found")

    # API Information
    def get_api_info(self) -> Dict[str, Any]:
        return self.api_info

    def get_access(self, contest_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        return self.access

    # Account operations
    def get_accounts(self, contest_id: str) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.accounts

    def get_account(self, contest_id: str, account_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if account_id not in self.accounts_by_id:
            raise HTTPException(status_code=404, detail=f"Account {account_id} not found")
        return self.accounts_by_id[account_id]

    # Contest operations
    def get_contests(self) -> List[Dict[str, Any]]:
        return [self.contest]

    def get_contest(self, contest_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        return self.contest

    def get_contest_state(self, contest_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        return self.contest_state

    # Problem operations
    def get_problems(self, contest_id: str) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.problems

    def get_problem(self, contest_id: str, problem_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if problem_id not in self.problems_by_id:
            raise HTTPException(status_code=404, detail=f"Problem {problem_id} not found")
        return self.problems_by_id[problem_id]

    # Team operations
    def get_teams(self, contest_id: str) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.teams

    def get_team(self, contest_id: str, team_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if team_id not in self.teams_by_id:
            raise HTTPException(status_code=404, detail=f"Team {team_id} not found")
        return self.teams_by_id[team_id]

    # Organization operations
    def get_organizations(self, contest_id: str) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.organizations

    def get_organization(self, contest_id: str, organization_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if organization_id not in self.organizations_by_id:
            raise HTTPException(status_code=404, detail=f"Organization {organization_id} not found")
        return self.organizations_by_id[organization_id]

    # Group operations
    def get_groups(self, contest_id: str) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.groups

    def get_group(self, contest_id: str, group_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if group_id not in self.groups_by_id:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
        return self.groups_by_id[group_id]

    # Language operations
    def get_languages(self, contest_id: str) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.languages

    def get_language(self, contest_id: str, language_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if language_id not in self.languages_by_id:
            raise HTTPException(status_code=404, detail=f"Language {language_id} not found")
        return self.languages_by_id[language_id]

    # Judgement type operations
    def get_judgement_types(self, contest_id: str) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.judgement_types

    def get_judgement_type(self, contest_id: str, judgement_type_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if judgement_type_id not in self.judgement_types_by_id:
            raise HTTPException(status_code=404, detail=f"Judgement type {judgement_type_id} not found")
        return self.judgement_types_by_id[judgement_type_id]

    # Submission operations
    def get_submissions(self, contest_id: str) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.submissions

    def get_submission(self, contest_id: str, submission_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if submission_id not in self.submissions_by_id:
            raise HTTPException(status_code=404, detail=f"Submission {submission_id} not found")
        return self.submissions_by_id[submission_id]

    # Judgement operations
    def get_judgements(self, contest_id: str, submission_id: Optional[str] = None) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)

        if submission_id is not None:
            if submission_id not in self.judgements_by_submission_id:
                raise HTTPException(status_code=404, detail=f"Submission id not found: {submission_id}")
            return self.judgements_by_submission_id[submission_id]

        return self.judgements

    def get_judgement(self, contest_id: str, judgement_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if judgement_id not in self.judgements_by_id:
            raise HTTPException(status_code=404, detail=f"Judgement {judgement_id} not found")
        return self.judgements_by_id[judgement_id]

    # Run operations
    def get_runs(self, contest_id: str, judgement_id: Optional[str] = None) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)

        if judgement_id is not None:
            if judgement_id not in self.runs_by_judgement_id:
                raise HTTPException(status_code=404, detail=f"Judgement id not found: {judgement_id}")
            return self.runs_by_judgement_id[judgement_id]

        return self.runs

    def get_run(self, contest_id: str, run_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if run_id not in self.runs_by_id:
            raise HTTPException(status_code=404, detail=f"Run {run_id} not found")
        return self.runs_by_id[run_id]

    # Clarification operations
    def get_clarifications(
        self,
        contest_id: str,
    ) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.clarifications

    def get_clarification(self, contest_id: str, clarification_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if clarification_id not in self.clarifications_by_id:
            raise HTTPException(status_code=404, detail=f"Clarification {clarification_id} not found")
        return self.clarifications_by_id[clarification_id]

    # Award operations
    def get_awards(self, contest_id: str) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)
        return self.awards

    def get_award(self, contest_id: str, award_id: str) -> Dict[str, Any]:
        self.validate_contest_id(contest_id)
        if award_id not in self.awards_by_id:
            raise HTTPException(status_code=404, detail=f"Award {award_id} not found")
        return self.awards_by_id[award_id]

    # Event Feed operations
    def get_event_feed(self, contest_id: str, since_token: Optional[str] = None) -> List[Dict[str, Any]]:
        self.validate_contest_id(contest_id)

        if since_token is None:
            return self.event_feed

        idx = bisect.bisect_left(self.event_feed_tokens, since_token)
        return self.event_feed[idx:]
