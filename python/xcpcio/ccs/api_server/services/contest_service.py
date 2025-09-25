"""
Contest Service

Business logic layer for Contest API operations.
Handles file reading, data validation, and business operations.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from fastapi import HTTPException

from xcpcio.__version__ import __version__


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

    def _load_indexes(self) -> None:
        """Load and index commonly accessed data for faster lookups"""
        # Load contest data
        self.contest_data = self.load_json_file("contest.json")

        # Load organizations and create index
        organizations_data = self.load_json_file("organizations.json")
        self.organizations_by_id = {org["id"]: org for org in organizations_data}

        # Load teams and create index
        teams_data = self.load_json_file("teams.json")
        self.teams_by_id = {team["id"]: team for team in teams_data}

        # Load problems and create index
        problems_data = self.load_json_file("problems.json")
        self.problems_by_id = {problem["id"]: problem for problem in problems_data}

        # Load submissions and create index
        submissions_data = self.load_json_file("submissions.json")
        self.submissions_by_id = {submission["id"]: submission for submission in submissions_data}

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
        """Get API information"""
        return {
            "version": "2023-06",
            "version_url": "https://ccs-specs.icpc.io/2023-06/contest_api",
            "name": "XCPCIO",
            "provider": {
                "name": "XCPCIO",
                "version": __version__,
            },
        }

    def get_access_info(self, contest_id: str) -> Dict[str, Any]:
        """Get access information for current client"""
        self.validate_contest_id(contest_id)
        return {
            "capabilities": [],
            "endpoints": [
                {
                    "type": "contest",
                    "properties": [
                        "id",
                        "name",
                        "formal_name",
                        "start_time",
                        "duration",
                        "scoreboard_type",
                        "penalty_time",
                    ],
                },
                {
                    "type": "problems",
                    "properties": ["id", "label", "name", "ordinal", "color", "rgb", "time_limit", "test_data_count"],
                },
                {"type": "teams", "properties": ["id", "name", "label", "organization_id", "group_ids", "hidden"]},
                {"type": "organizations", "properties": ["id", "name", "formal_name"]},
                {"type": "groups", "properties": ["id", "name"]},
                {"type": "judgement-types", "properties": ["id", "name", "penalty", "solved"]},
                {"type": "languages", "properties": ["id", "name", "extensions"]},
                {
                    "type": "state",
                    "properties": ["started", "ended", "frozen", "thawed", "finalized", "end_of_updates"],
                },
                {
                    "type": "submissions",
                    "properties": ["id", "team_id", "problem_id", "language_id", "time", "contest_time"],
                },
                {
                    "type": "judgements",
                    "properties": ["id", "submission_id", "judgement_type_id", "start_time", "start_contest_time"],
                },
                {
                    "type": "runs",
                    "properties": [
                        "id",
                        "judgement_id",
                        "ordinal",
                        "judgement_type_id",
                        "time",
                        "contest_time",
                        "run_time",
                    ],
                },
                {
                    "type": "clarifications",
                    "properties": ["id", "from_team_id", "to_team_id", "problem_id", "text", "time", "contest_time"],
                },
                {"type": "awards", "properties": ["id", "citation", "team_ids"]},
            ],
        }

    # Contest operations
    def get_contests(self) -> List[Dict[str, Any]]:
        """Get all contests"""
        contest_data = self.load_json_file("contest.json")
        return [contest_data]

    def get_contest(self, contest_id: str) -> Dict[str, Any]:
        """Get specific contest"""
        self.validate_contest_id(contest_id)
        return self.load_json_file("contest.json")

    def get_contest_state(self, contest_id: str) -> Dict[str, Any]:
        """Get contest state"""
        self.validate_contest_id(contest_id)
        return self.load_json_file("state.json")

    # Problem operations
    def get_problems(self, contest_id: str) -> List[Dict[str, Any]]:
        """Get all problems"""
        self.validate_contest_id(contest_id)
        return self.load_json_file("problems.json")

    def get_problem(self, contest_id: str, problem_id: str) -> Dict[str, Any]:
        """Get specific problem"""
        self.validate_contest_id(contest_id)
        problems = self.load_json_file("problems.json")
        for problem in problems:
            if problem["id"] == problem_id:
                return problem
        raise HTTPException(status_code=404, detail=f"Problem {problem_id} not found")

    # Team operations
    def get_teams(self, contest_id: str, group_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all teams, optionally filtered by group"""
        self.validate_contest_id(contest_id)
        teams = self.load_json_file("teams.json")

        if group_id:
            filtered_teams = []
            for team in teams:
                if group_id in team.get("group_ids", []):
                    filtered_teams.append(team)
            return filtered_teams

        return teams

    def get_team(self, contest_id: str, team_id: str) -> Dict[str, Any]:
        """Get specific team"""
        self.validate_contest_id(contest_id)
        teams = self.load_json_file("teams.json")
        for team in teams:
            if team["id"] == team_id:
                return team
        raise HTTPException(status_code=404, detail=f"Team {team_id} not found")

    # Organization operations
    def get_organizations(self, contest_id: str) -> List[Dict[str, Any]]:
        """Get all organizations"""
        self.validate_contest_id(contest_id)
        return self.load_json_file("organizations.json")

    def get_organization(self, contest_id: str, organization_id: str) -> Dict[str, Any]:
        """Get specific organization"""
        self.validate_contest_id(contest_id)
        organizations = self.load_json_file("organizations.json")
        for org in organizations:
            if org["id"] == organization_id:
                return org
        raise HTTPException(status_code=404, detail=f"Organization {organization_id} not found")

    # Group operations
    def get_groups(self, contest_id: str) -> List[Dict[str, Any]]:
        """Get all groups"""
        self.validate_contest_id(contest_id)
        return self.load_json_file("groups.json")

    def get_group(self, contest_id: str, group_id: str) -> Dict[str, Any]:
        """Get specific group"""
        self.validate_contest_id(contest_id)
        groups = self.load_json_file("groups.json")
        for group in groups:
            if group["id"] == group_id:
                return group
        raise HTTPException(status_code=404, detail=f"Group {group_id} not found")

    # Language operations
    def get_languages(self, contest_id: str) -> List[Dict[str, Any]]:
        """Get all languages"""
        self.validate_contest_id(contest_id)
        return self.load_json_file("languages.json")

    def get_language(self, contest_id: str, language_id: str) -> Dict[str, Any]:
        """Get specific language"""
        self.validate_contest_id(contest_id)
        languages = self.load_json_file("languages.json")
        for lang in languages:
            if lang["id"] == language_id:
                return lang
        raise HTTPException(status_code=404, detail=f"Language {language_id} not found")

    # Judgement type operations
    def get_judgement_types(self, contest_id: str) -> List[Dict[str, Any]]:
        """Get all judgement types"""
        self.validate_contest_id(contest_id)
        return self.load_json_file("judgement-types.json")

    def get_judgement_type(self, contest_id: str, judgement_type_id: str) -> Dict[str, Any]:
        """Get specific judgement type"""
        self.validate_contest_id(contest_id)
        judgement_types = self.load_json_file("judgement-types.json")
        for jt in judgement_types:
            if jt["id"] == judgement_type_id:
                return jt
        raise HTTPException(status_code=404, detail=f"Judgement type {judgement_type_id} not found")

    # Submission operations
    def get_submissions(
        self, contest_id: str, team_id: Optional[str] = None, problem_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get all submissions, optionally filtered"""
        self.validate_contest_id(contest_id)
        submissions = self.load_json_file("submissions.json")

        # Apply filters
        if team_id:
            submissions = [s for s in submissions if s.get("team_id") == team_id]
        if problem_id:
            submissions = [s for s in submissions if s.get("problem_id") == problem_id]

        return submissions

    def get_submission(self, contest_id: str, submission_id: str) -> Dict[str, Any]:
        """Get specific submission"""
        self.validate_contest_id(contest_id)
        submissions = self.load_json_file("submissions.json")
        for submission in submissions:
            if submission["id"] == submission_id:
                return submission
        raise HTTPException(status_code=404, detail=f"Submission {submission_id} not found")

    # Judgement operations
    def get_judgements(self, contest_id: str, submission_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all judgements, optionally filtered by submission"""
        self.validate_contest_id(contest_id)
        judgements = self.load_json_file("judgements.json")

        if submission_id:
            judgements = [j for j in judgements if j.get("submission_id") == submission_id]

        return judgements

    def get_judgement(self, contest_id: str, judgement_id: str) -> Dict[str, Any]:
        """Get specific judgement"""
        self.validate_contest_id(contest_id)
        judgements = self.load_json_file("judgements.json")
        for judgement in judgements:
            if judgement["id"] == judgement_id:
                return judgement
        raise HTTPException(status_code=404, detail=f"Judgement {judgement_id} not found")

    # Run operations
    def get_runs(self, contest_id: str, judgement_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get all runs, optionally filtered by judgement"""
        self.validate_contest_id(contest_id)
        runs = self.load_json_file("runs.json")

        if judgement_id:
            runs = [r for r in runs if r.get("judgement_id") == judgement_id]

        return runs

    def get_run(self, contest_id: str, run_id: str) -> Dict[str, Any]:
        """Get specific run"""
        self.validate_contest_id(contest_id)
        runs = self.load_json_file("runs.json")
        for run in runs:
            if run["id"] == run_id:
                return run
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found")

    # Clarification operations
    def get_clarifications(
        self,
        contest_id: str,
        from_team_id: Optional[str] = None,
        to_team_id: Optional[str] = None,
        problem_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get all clarifications, optionally filtered"""
        self.validate_contest_id(contest_id)
        clarifications = self.load_json_file("clarifications.json")

        # Apply filters (empty string means null)
        if from_team_id is not None:
            if from_team_id == "":
                clarifications = [c for c in clarifications if c.get("from_team_id") is None]
            else:
                clarifications = [c for c in clarifications if c.get("from_team_id") == from_team_id]

        if to_team_id is not None:
            if to_team_id == "":
                clarifications = [c for c in clarifications if c.get("to_team_id") is None]
            else:
                clarifications = [c for c in clarifications if c.get("to_team_id") == to_team_id]

        if problem_id is not None:
            if problem_id == "":
                clarifications = [c for c in clarifications if c.get("problem_id") is None]
            else:
                clarifications = [c for c in clarifications if c.get("problem_id") == problem_id]

        return clarifications

    def get_clarification(self, contest_id: str, clarification_id: str) -> Dict[str, Any]:
        """Get specific clarification"""
        self.validate_contest_id(contest_id)
        clarifications = self.load_json_file("clarifications.json")
        for clarification in clarifications:
            if clarification["id"] == clarification_id:
                return clarification
        raise HTTPException(status_code=404, detail=f"Clarification {clarification_id} not found")

    # Award operations
    def get_awards(self, contest_id: str) -> List[Dict[str, Any]]:
        """Get all awards"""
        self.validate_contest_id(contest_id)
        return self.load_json_file("awards.json")

    def get_award(self, contest_id: str, award_id: str) -> Dict[str, Any]:
        """Get specific award"""
        self.validate_contest_id(contest_id)
        awards = self.load_json_file("awards.json")
        for award in awards:
            if award["id"] == award_id:
                return award
        raise HTTPException(status_code=404, detail=f"Award {award_id} not found")
