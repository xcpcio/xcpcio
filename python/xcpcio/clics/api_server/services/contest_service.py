"""
Contest Service

Business logic layer for Contest API operations.
Handles file reading, data validation, and business operations.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from xcpcio.__version__ import __version__
from xcpcio.clics.base.types import FileAttr
from xcpcio.clics.reader.interface import BaseContestReader

logger = logging.getLogger(__name__)


class ContestService:
    """Service class for contest-related operations"""

    def __init__(self, reader_dict: Dict[str, BaseContestReader]):
        self.reader_dict = reader_dict

    def _get_reader(self, contest_id: str) -> BaseContestReader:
        if contest_id not in self.reader_dict:
            raise HTTPException(status_code=404, detail=f"Contest {contest_id} not found")
        return self.reader_dict[contest_id]

    # API Information
    def get_api_info(self) -> Dict[str, Any]:
        return {
            "version": "2023-06",
            "version_url": "https://ccs-specs.icpc.io/2023-06/contest_api",
            "name": "XCPCIO",
            "provider": {
                "name": "XCPCIO",
                "version": __version__,
            },
        }

    def get_access(self, contest_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_access()

    # Account operations
    def get_accounts(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_accounts()

    def get_account(self, contest_id: str, account_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_account(account_id)

    # Contest operations
    def get_contests(self) -> List[Dict[str, Any]]:
        return [reader.get_contest() for reader in self.reader_dict.values()]

    def get_contest(self, contest_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_contest()

    def get_contest_state(self, contest_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_contest_state()

    def get_contest_banner(self, contest_id: str) -> FileAttr:
        reader = self._get_reader(contest_id)
        return reader.get_contest_banner()

    def get_contest_problemset(self, contest_id: str) -> FileAttr:
        reader = self._get_reader(contest_id)
        return reader.get_contest_problemset()

    # Problem operations
    def get_problems(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_problems()

    def get_problem(self, contest_id: str, problem_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_problem(problem_id)

    def get_problem_statement(self, contest_id: str, problem_id: str) -> FileAttr:
        reader = self._get_reader(contest_id)
        return reader.get_problem_statement(problem_id)

    # Team operations
    def get_teams(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_teams()

    def get_team(self, contest_id: str, team_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_team(team_id)

    def get_team_photo(self, contest_id: str, team_id: str) -> FileAttr:
        reader = self._get_reader(contest_id)
        return reader.get_team_photo(team_id)

    # Organization operations
    def get_organizations(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_organizations()

    def get_organization(self, contest_id: str, organization_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_organization(organization_id)

    def get_organization_logo(self, contest_id: str, organization_id: str) -> FileAttr:
        reader = self._get_reader(contest_id)
        return reader.get_organization_logo(organization_id)

    # Group operations
    def get_groups(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_groups()

    def get_group(self, contest_id: str, group_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_group(group_id)

    # Language operations
    def get_languages(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_languages()

    def get_language(self, contest_id: str, language_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_language(language_id)

    # Judgement type operations
    def get_judgement_types(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_judgement_types()

    def get_judgement_type(self, contest_id: str, judgement_type_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_judgement_type(judgement_type_id)

    # Submission operations
    def get_submissions(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_submissions()

    def get_submission(self, contest_id: str, submission_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_submission(submission_id)

    def get_submission_file(self, contest_id: str, submission_id: str) -> FileAttr:
        reader = self._get_reader(contest_id)
        return reader.get_submission_file(submission_id)

    # Judgement operations
    def get_judgements(self, contest_id: str, submission_id: Optional[str] = None) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_judgements(submission_id)

    def get_judgement(self, contest_id: str, judgement_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_judgement(judgement_id)

    # Run operations
    def get_runs(self, contest_id: str, judgement_id: Optional[str] = None) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_runs(judgement_id)

    def get_run(self, contest_id: str, run_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_run(run_id)

    # Clarification operations
    def get_clarifications(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_clarifications()

    def get_clarification(self, contest_id: str, clarification_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_clarification(clarification_id)

    # Award operations
    def get_awards(self, contest_id: str) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_awards()

    def get_award(self, contest_id: str, award_id: str) -> Dict[str, Any]:
        reader = self._get_reader(contest_id)
        return reader.get_award(award_id)

    # Event Feed operations
    def get_event_feed(self, contest_id: str, since_token: Optional[str] = None) -> List[Dict[str, Any]]:
        reader = self._get_reader(contest_id)
        return reader.get_event_feed(since_token)
