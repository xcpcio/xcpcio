from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from xcpcio.clics.base.types import FileAttr


class BaseContestReader(ABC):
    # API Information
    @abstractmethod
    def get_api_info(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_access(self) -> Dict[str, Any]:
        pass

    # Account operations
    @abstractmethod
    def get_accounts(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_account(self, account_id: str) -> Dict[str, Any]:
        pass

    # Contest operations
    @abstractmethod
    def get_contest_id(self) -> str:
        pass

    @abstractmethod
    def get_contest(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_contest_state(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_contest_banner(self) -> FileAttr:
        pass

    @abstractmethod
    def get_contest_problemset(self) -> FileAttr:
        pass

    # Problem operations
    @abstractmethod
    def get_problems(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_problem(self, problem_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_problem_statement(self, problem_id: str) -> FileAttr:
        pass

    # Team operations
    @abstractmethod
    def get_teams(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_team(self, team_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_team_photo(self, team_id: str) -> FileAttr:
        pass

    # Organization operations
    @abstractmethod
    def get_organizations(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_organization(self, organization_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_organization_logo(self, organization_id: str) -> FileAttr:
        pass

    # Group operations
    @abstractmethod
    def get_groups(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_group(self, group_id: str) -> Dict[str, Any]:
        pass

    # Language operations
    @abstractmethod
    def get_languages(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_language(self, language_id: str) -> Dict[str, Any]:
        pass

    # Judgement type operations
    @abstractmethod
    def get_judgement_types(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_judgement_type(self, judgement_type_id: str) -> Dict[str, Any]:
        pass

    # Submission operations
    @abstractmethod
    def get_submissions(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_submission(self, submission_id: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_submission_file(self, submission_id: str) -> FileAttr:
        pass

    # Judgement operations
    @abstractmethod
    def get_judgements(self, submission_id: Optional[str] = None) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_judgement(self, judgement_id: str) -> Dict[str, Any]:
        pass

    # Run operations
    @abstractmethod
    def get_runs(self, judgement_id: Optional[str] = None) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_run(self, run_id: str) -> Dict[str, Any]:
        pass

    # Clarification operations
    @abstractmethod
    def get_clarifications(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_clarification(self, clarification_id: str) -> Dict[str, Any]:
        pass

    # Award operations
    @abstractmethod
    def get_awards(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def get_award(self, award_id: str) -> Dict[str, Any]:
        pass

    # Event Feed operations
    @abstractmethod
    def get_event_feed(self, since_token: Optional[str] = None) -> List[Dict[str, Any]]:
        pass
