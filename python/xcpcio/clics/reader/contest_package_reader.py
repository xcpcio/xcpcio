import bisect
import json
import logging
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from fastapi import HTTPException

from xcpcio.clics.base.types import FileAttr
from xcpcio.clics.reader.interface import BaseContestReader

logger = logging.getLogger(__name__)


class ContestPackageReader(BaseContestReader):
    def __init__(self, contest_package_dir: Path):
        self.contest_package_dir = contest_package_dir
        if not self.contest_package_dir.exists():
            raise ValueError(f"Contest package directory does not exist: {contest_package_dir}")

        self._load_indexes()

    def _create_index_by_id(self, data: List[Dict[str, Any]], id_name: str) -> Dict[str, List[Dict]]:
        res = defaultdict(list)
        for item in data:
            res[item[id_name]].append(item)
        return res

    def _load_json_file(
        self,
        filepath: str,
        default_value: Optional[Union[Dict[str, Any], List[Any]]] = None,
    ) -> Union[Dict[str, Any], List[Any]]:
        full_path = self.contest_package_dir / filepath
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            if default_value is not None:
                logger.warning(f"File not found, will load default value. [full_path={full_path}]")
                return default_value
            raise HTTPException(status_code=404, detail=f"File not found: {filepath}")
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON in file {filepath}: {e}")

    def _load_ndjson_file(
        self, filepath: str, default_value: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        full_path = self.contest_package_dir / filepath
        try:
            data = list()
            with open(full_path, "r", encoding="utf-8") as f:
                for line in f.readlines():
                    data.append(json.loads(line))
            return data
        except FileNotFoundError:
            if default_value is not None:
                logger.warning(f"File not found, will load default value. [full_path={full_path}]")
                return default_value
            raise HTTPException(status_code=404, detail=f"File not found: {filepath}")
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=500, detail=f"Invalid JSON in file {filepath}: {e}")

    def _load_indexes(self) -> None:
        self.access = self._load_json_file("access.json", default_value={})

        self.accounts = self._load_json_file("accounts.json", default_value=[])
        self.accounts_by_id = {account["id"]: account for account in self.accounts}

        self.api_info = self._load_json_file("api.json", default_value={})

        self.awards = self._load_json_file("awards.json", default_value=[])
        self.awards_by_id = {award["id"]: award for award in self.awards}

        self.clarifications = self._load_json_file("clarifications.json", default_value=[])
        self.clarifications_by_id = {clarification["id"]: clarification for clarification in self.clarifications}

        self.contest = self._load_json_file("contest.json", default_value={})
        self.contest_state = self._load_json_file("state.json", default_value={})

        self.groups = self._load_json_file("groups.json", default_value=[])
        self.groups_by_id = {group["id"]: group for group in self.groups}

        self.judgement_types = self._load_json_file("judgement-types.json", default_value=[])
        self.judgement_types_by_id = {judgement_type["id"]: judgement_type for judgement_type in self.judgement_types}

        self.judgements = self._load_json_file("judgements.json", default_value=[])
        self.judgements_by_id = {judgement["id"]: judgement for judgement in self.judgements}
        self.judgements_by_submission_id = self._create_index_by_id(self.judgements, "submission_id")

        self.languages = self._load_json_file("languages.json", default_value=[])
        self.languages_by_id = {language["id"]: language for language in self.languages}

        self.organizations = self._load_json_file("organizations.json", default_value=[])
        self.organizations_by_id = {org["id"]: org for org in self.organizations}

        self.problems = self._load_json_file("problems.json", default_value=[])
        self.problems_by_id = {problem["id"]: problem for problem in self.problems}

        self.runs = self._load_json_file("runs.json", default_value=[])
        self.runs_by_id = {run["id"]: run for run in self.runs}
        self.runs_by_judgement_id = self._create_index_by_id(self.runs, "judgement_id")

        self.submissions = self._load_json_file("submissions.json", default_value=[])
        self.submissions_by_id = {submission["id"]: submission for submission in self.submissions}

        self.teams = self._load_json_file("teams.json", default_value=[])
        self.teams_by_id = {team["id"]: team for team in self.teams}

        self.event_feed = self._load_ndjson_file("event-feed.ndjson", default_value=[])
        self.event_feed_tokens = [event["token"] for event in self.event_feed]

        self.contest_id = self.contest.get("id", "")

    def _get_file_attr(self, expected_href: str, base_path: Path, files: List[Dict]) -> FileAttr:
        for file in files:
            href = file["href"]
            if href == expected_href:
                filename = file["filename"]
                mime_type = file["mime"]
                filepath: Path = base_path / filename
                if not filepath.exists():
                    raise FileNotFoundError(f"File not found: {filepath}")
                return FileAttr(path=filepath, media_type=mime_type, name=filename)
        raise KeyError(f"Href not found: {expected_href}")

    # API Information
    def get_api_info(self) -> Dict[str, Any]:
        return self.api_info

    def get_access(self) -> Dict[str, Any]:
        return self.access

    # Account operations
    def get_accounts(self) -> List[Dict[str, Any]]:
        return self.accounts

    def get_account(self, account_id: str) -> Dict[str, Any]:
        if account_id not in self.accounts_by_id:
            raise HTTPException(status_code=404, detail=f"Account {account_id} not found")
        return self.accounts_by_id[account_id]

    # Contest operations
    def get_contest_id(self) -> str:
        return self.contest["id"]

    def get_contest(self) -> Dict[str, Any]:
        return self.contest

    def get_contest_state(self) -> Dict[str, Any]:
        return self.contest_state

    def get_contest_banner(self) -> FileAttr:
        expected_href = f"contests/{self.contest_id}/banner"
        base_path = self.contest_package_dir / "contest"
        files = self.contest.get("banner", [])

        try:
            return self._get_file_attr(expected_href, base_path, files)
        except Exception as e:
            raise HTTPException(status_code=404, detail=f"Banner not found. [contest_id={self.contest_id}] [err={e}]")

    def get_contest_problemset(self) -> FileAttr:
        expected_href = f"contests/{self.contest_id}/problemset"
        base_path = self.contest_package_dir / "contest"
        files = self.contest.get("problemset", [])

        try:
            return self._get_file_attr(expected_href, base_path, files)
        except Exception as e:
            raise HTTPException(
                status_code=404, detail=f"Problemset not found. [contest_id={self.contest_id}] [err={e}]"
            )

    # Problem operations
    def get_problems(self) -> List[Dict[str, Any]]:
        return self.problems

    def get_problem(self, problem_id: str) -> Dict[str, Any]:
        if problem_id not in self.problems_by_id:
            raise HTTPException(status_code=404, detail=f"Problem {problem_id} not found")
        return self.problems_by_id[problem_id]

    def get_problem_statement(self, problem_id: str) -> FileAttr:
        expected_href = f"contests/{self.contest_id}/problems/{problem_id}/statement"
        base_path = self.contest_package_dir / "problems" / problem_id
        files = self.get_problem(problem_id).get("statement", [])

        try:
            return self._get_file_attr(expected_href, base_path, files)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Problem statement not found. [contest_id={self.contest_id}] [problem_id={problem_id}] [err={e}]",
            )

    # Team operations
    def get_teams(self) -> List[Dict[str, Any]]:
        return self.teams

    def get_team(self, team_id: str) -> Dict[str, Any]:
        if team_id not in self.teams_by_id:
            raise HTTPException(status_code=404, detail=f"Team {team_id} not found")
        return self.teams_by_id[team_id]

    def get_team_photo(self, team_id: str) -> FileAttr:
        expected_href = f"contests/{self.contest_id}/teams/{team_id}/photo"
        base_path = self.contest_package_dir / "teams" / team_id
        files = self.get_team(team_id).get("photo", [])

        try:
            return self._get_file_attr(expected_href, base_path, files)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Team photo not found. [contest_id={self.contest_id}] [team_id={team_id}] [err={e}]",
            )

    # Organization operations
    def get_organizations(self) -> List[Dict[str, Any]]:
        return self.organizations

    def get_organization(self, organization_id: str) -> Dict[str, Any]:
        if organization_id not in self.organizations_by_id:
            raise HTTPException(status_code=404, detail=f"Organization {organization_id} not found")
        return self.organizations_by_id[organization_id]

    def get_organization_logo(self, organization_id: str) -> FileAttr:
        expected_href = f"contests/{self.contest_id}/organizations/{organization_id}/logo"
        base_path = self.contest_package_dir / "organizations" / organization_id
        files = self.get_organization(organization_id).get("logo", [])

        try:
            return self._get_file_attr(expected_href, base_path, files)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Organization logo not found. [contest_id={self.contest_id}] [organization_id={organization_id}] [err={e}]",
            )

    # Group operations
    def get_groups(self) -> List[Dict[str, Any]]:
        return self.groups

    def get_group(self, group_id: str) -> Dict[str, Any]:
        if group_id not in self.groups_by_id:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")
        return self.groups_by_id[group_id]

    # Language operations
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
        expected_href = f"contests/{self.contest_id}/submissions/{submission_id}/files"
        base_path = self.contest_package_dir / "submissions" / submission_id
        files = self.get_submission(submission_id).get("files", [])

        try:
            return self._get_file_attr(expected_href, base_path, files)
        except Exception as e:
            raise HTTPException(
                status_code=404,
                detail=f"Submission file not found. [contest_id={self.contest_id}] [submission_id={submission_id}] [err={e}]",
            )

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

    # Run operations
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

    # Clarification operations
    def get_clarifications(self) -> List[Dict[str, Any]]:
        return self.clarifications

    def get_clarification(self, clarification_id: str) -> Dict[str, Any]:
        if clarification_id not in self.clarifications_by_id:
            raise HTTPException(status_code=404, detail=f"Clarification {clarification_id} not found")
        return self.clarifications_by_id[clarification_id]

    # Award operations
    def get_awards(self) -> List[Dict[str, Any]]:
        return self.awards

    def get_award(self, award_id: str) -> Dict[str, Any]:
        if award_id not in self.awards_by_id:
            raise HTTPException(status_code=404, detail=f"Award {award_id} not found")
        return self.awards_by_id[award_id]

    # Event Feed operations
    def get_event_feed(self, since_token: Optional[str] = None) -> List[Dict[str, Any]]:
        if since_token is None:
            return self.event_feed

        idx = bisect.bisect_left(self.event_feed_tokens, since_token)
        return self.event_feed[idx:]
