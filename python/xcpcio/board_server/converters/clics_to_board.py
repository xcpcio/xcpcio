"""
CLICS to Board Converter

Converts CLICS format data to XCPCIO Board format for the leaderboard frontend.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from xcpcio import types as board_types
from xcpcio.clics.reader.interface import BaseContestReader

logger = logging.getLogger(__name__)


# Mapping from CLICS judgement type IDs to XCPCIO submission statuses
JUDGEMENT_TYPE_MAPPING = {
    # Accepted
    "AC": "CORRECT",
    "accepted": "CORRECT",
    # Wrong Answer
    "WA": "WRONG_ANSWER",
    "wrong-answer": "WRONG_ANSWER",
    # Time Limit Exceeded
    "TLE": "TIME_LIMIT_EXCEEDED",
    "timelimit": "TIME_LIMIT_EXCEEDED",
    # Runtime Error
    "RTE": "RUNTIME_ERROR",
    "RE": "RUNTIME_ERROR",
    "run-error": "RUNTIME_ERROR",
    # Compilation Error
    "CE": "COMPILATION_ERROR",
    "compiler-error": "COMPILATION_ERROR",
    # Memory Limit Exceeded
    "MLE": "MEMORY_LIMIT_EXCEEDED",
    # Output Limit Exceeded
    "OLE": "OUTPUT_LIMIT_EXCEEDED",
    # No Output
    "NO": "NO_OUTPUT",
    "no-output": "NO_OUTPUT",
    # Presentation Error (treat as wrong answer)
    "PE": "PRESENTATION_ERROR",
    # Judgement Error
    "JE": "JUDGEMENT_FAILED",
    # Security Error
    "SE": "SECURITY_VIOLATED",
}


class ClicsToBoardConverter:
    """
    Converts CLICS data format to XCPCIO Board format.

    This converter works with any BaseContestReader implementation,
    including both ContestPackageReader (local files) and ContestApiReader (HTTP API).
    """

    def __init__(self, reader: BaseContestReader):
        """
        Initialize the converter.

        Args:
            reader: A BaseContestReader implementation (ContestPackageReader or ContestApiReader)
        """
        self.reader = reader
        self._judgement_type_map: Dict[str, str] = {}
        self._organizations_by_id: Dict[str, Dict] = {}
        self._groups_by_id: Dict[str, Dict] = {}

    def _build_lookups(self):
        """Build lookup tables for efficient conversion."""
        # Build judgement type mapping
        for jt in self.reader.get_judgement_types():
            jt_id = jt.get("id", "")
            # Check if ID is in our mapping
            if jt_id in JUDGEMENT_TYPE_MAPPING:
                self._judgement_type_map[jt_id] = JUDGEMENT_TYPE_MAPPING[jt_id]
            # Check if judgement type is "solved" (accepted)
            elif jt.get("solved", False):
                self._judgement_type_map[jt_id] = "CORRECT"
            # Check if it has penalty (rejected)
            elif jt.get("penalty", False):
                self._judgement_type_map[jt_id] = "INCORRECT"
            else:
                self._judgement_type_map[jt_id] = "UNKNOWN"

        # Build organization lookup
        for org in self.reader.get_organizations():
            self._organizations_by_id[org["id"]] = org

        # Build group lookup
        for group in self.reader.get_groups():
            self._groups_by_id[group["id"]] = group

    def _parse_clics_time(self, time_str: Optional[str]) -> Optional[datetime]:
        """
        Parse CLICS absolute time string to datetime.

        CLICS format: 2024-01-01T10:00:00+08:00 or 2024-01-01T10:00:00Z
        """
        if not time_str:
            return None
        try:
            # Handle Z suffix
            if time_str.endswith("Z"):
                time_str = time_str[:-1] + "+00:00"
            return datetime.fromisoformat(time_str)
        except ValueError as e:
            logger.warning(f"Failed to parse time string: {time_str}, error: {e}")
            return None

    def _parse_duration(self, duration_str: Optional[str]) -> timedelta:
        """
        Parse CLICS duration string to timedelta.

        CLICS format: H:MM:SS or H:MM:SS.mmm
        """
        if not duration_str:
            return timedelta()

        try:
            # Handle negative durations
            negative = duration_str.startswith("-")
            if negative:
                duration_str = duration_str[1:]

            parts = duration_str.split(":")
            hours = int(parts[0])
            minutes = int(parts[1]) if len(parts) > 1 else 0
            # Handle seconds with optional milliseconds
            seconds_part = parts[2] if len(parts) > 2 else "0"
            seconds = float(seconds_part)

            result = timedelta(hours=hours, minutes=minutes, seconds=seconds)
            return -result if negative else result
        except (ValueError, IndexError) as e:
            logger.warning(f"Failed to parse duration string: {duration_str}, error: {e}")
            return timedelta()

    def _parse_reltime_to_seconds(self, reltime: Optional[str]) -> int:
        """Parse CLICS relative time to seconds."""
        if not reltime:
            return 0
        td = self._parse_duration(reltime)
        return int(td.total_seconds())

    def _get_text_color(self, bg_color: Optional[str]) -> str:
        """Calculate appropriate text color based on background color."""
        if not bg_color:
            return "#000"
        return "#fff" if self._is_dark_color(bg_color) else "#000"

    def _is_dark_color(self, color: str) -> bool:
        """Check if a color is dark based on luminance."""
        if not color.startswith("#"):
            return False
        hex_color = color.lstrip("#")
        if len(hex_color) == 3:
            hex_color = "".join(c * 2 for c in hex_color)
        if len(hex_color) != 6:
            return False
        try:
            r = int(hex_color[0:2], 16)
            g = int(hex_color[2:4], 16)
            b = int(hex_color[4:6], 16)
            # Using luminance formula
            luminance = 0.299 * r + 0.587 * g + 0.114 * b
            return luminance < 128
        except ValueError:
            return False

    def convert_contest(self) -> board_types.Contest:
        """
        Convert CLICS contest data to Board Contest format (config.json).

        Returns:
            Board Contest model
        """
        self._build_lookups()

        clics_contest = self.reader.get_contest()
        clics_problems = self.reader.get_problems()
        clics_groups = self.reader.get_groups()

        # Parse times
        start_time_dt = self._parse_clics_time(clics_contest.get("start_time"))
        duration = self._parse_duration(clics_contest.get("duration", "5:00:00"))

        if start_time_dt:
            start_time = int(start_time_dt.timestamp())
            end_time = int((start_time_dt + duration).timestamp())
        else:
            # Fallback: use current time
            now = datetime.now(timezone.utc)
            start_time = int(now.timestamp())
            end_time = int((now + duration).timestamp())

        # Calculate frozen time
        freeze_duration = self._parse_duration(clics_contest.get("scoreboard_freeze_duration", "1:00:00"))
        frozen_time = int(freeze_duration.total_seconds())

        # Penalty time (CLICS uses minutes, Board uses seconds)
        penalty_minutes = clics_contest.get("penalty_time", 20)
        penalty = penalty_minutes * 60

        # Convert problems
        problem_ids = []
        balloon_colors = []
        sorted_problems = sorted(clics_problems, key=lambda p: p.get("ordinal", 0))
        for prob in sorted_problems:
            problem_ids.append(prob.get("label", prob.get("id")))
            # Get color from problem
            rgb = prob.get("rgb", prob.get("color", "#cccccc"))
            balloon_colors.append(
                board_types.BalloonColor(
                    color=self._get_text_color(rgb),
                    background_color=rgb,
                )
            )

        # Convert groups to group dictionary
        group_dict = {}
        for group in clics_groups:
            group_dict[group["id"]] = group.get("name", group["id"])

        # Get contest name
        contest_name = clics_contest.get("formal_name") or clics_contest.get("name", "")

        return board_types.Contest(
            contest_name=contest_name,
            start_time=start_time,
            end_time=end_time,
            frozen_time=frozen_time,
            penalty=penalty,
            problem_id=problem_ids,
            balloon_color=balloon_colors,
            group=group_dict if group_dict else None,
            options=board_types.ContestOptions(
                enable_organization=True,
            ),
            organizations=board_types.DataItem(url="organization.json"),
        )

    def convert_teams(self) -> Dict[str, board_types.Team]:
        """
        Convert CLICS teams to Board teams format (team.json).

        Returns:
            Dictionary mapping team_id to Board Team model
        """
        self._build_lookups()

        clics_teams = self.reader.get_teams()

        result = {}
        for team in clics_teams:
            team_id = team["id"]

            # Skip hidden teams
            if team.get("hidden", False):
                continue

            # Get organization name
            org_id = team.get("organization_id")
            org_name = None
            if org_id and org_id in self._organizations_by_id:
                org = self._organizations_by_id[org_id]
                org_name = org.get("formal_name") or org.get("name")

            # Get group list
            group_ids = team.get("group_ids", [])
            groups = []
            for gid in group_ids:
                if gid in self._groups_by_id:
                    groups.append(gid)  # Use group ID as key, not name

            # Get team name
            team_name = team.get("display_name") or team.get("name", "")

            result[team_id] = board_types.Team(
                id=team_id,
                name=team_name,
                description=team.get("description"),
                organization=org_name,
                organization_id=org_id,
                group=groups,
                icpc_id=team.get("icpc_id"),
            )

        return result

    def convert_submissions(self) -> List[board_types.Submission]:
        """
        Convert CLICS submissions + judgements to Board submissions format (run.json).

        Returns:
            List of Board Submission models
        """
        self._build_lookups()

        clics_submissions = self.reader.get_submissions()
        clics_judgements = self.reader.get_judgements()

        # Build judgement map: submission_id -> final judgement
        # Keep the latest judgement for each submission
        judgement_map: Dict[str, Dict] = {}
        for jdg in clics_judgements:
            sub_id = jdg.get("submission_id")
            if sub_id:
                # Overwrite with latest judgement
                judgement_map[sub_id] = jdg

        result = []
        for sub in clics_submissions:
            sub_id = sub["id"]

            # Calculate timestamp relative to contest start (in seconds)
            contest_time_str = sub.get("contest_time", "0:00:00")
            timestamp_seconds = self._parse_reltime_to_seconds(contest_time_str)

            # Get status from judgement
            judgement = judgement_map.get(sub_id)
            if judgement:
                jt_id = judgement.get("judgement_type_id")
                if jt_id:
                    status = self._judgement_type_map.get(jt_id, "PENDING")
                else:
                    status = "PENDING"
            else:
                status = "PENDING"

            result.append(
                board_types.Submission(
                    id=sub_id,
                    team_id=sub.get("team_id", ""),
                    problem_id=sub.get("problem_id", ""),
                    timestamp=timestamp_seconds,
                    status=status,
                    language=sub.get("language_id"),
                )
            )

        return result

    def convert_organizations(self) -> List[board_types.Organization]:
        """
        Convert CLICS organizations to Board organizations format (organization.json).

        Returns:
            List of Board Organization models
        """
        self._build_lookups()

        # Get CLICS API base URL for constructing logo URLs
        base_url = getattr(self.reader, "_base_url", None)

        result = []
        for org in self.reader.get_organizations():
            # Process logo
            logo_image = None
            logo_list = org.get("logo")
            if logo_list and len(logo_list) > 0 and base_url:
                logo_ref = logo_list[0]  # Use first logo
                href = logo_ref.get("href")
                if href:
                    # Construct full URL
                    logo_url = f"{base_url.rstrip('/')}{href}"
                    logo_image = board_types.Image(
                        url=logo_url,
                        mime=logo_ref.get("mime"),
                        width=logo_ref.get("width"),
                        height=logo_ref.get("height"),
                    )

            result.append(
                board_types.Organization(
                    id=org["id"],
                    name=org.get("formal_name") or org.get("name", ""),
                    icpc_id=org.get("icpc_id"),
                    logo=logo_image,
                )
            )

        return result

    def convert_all(self) -> Dict[str, Any]:
        """
        Convert all data to Board format.

        Returns:
            Dictionary with 'contest', 'teams', 'submissions', and 'organizations' keys
        """
        contest = self.convert_contest()
        teams = self.convert_teams()
        submissions = self.convert_submissions()
        organizations = self.convert_organizations()

        return {
            "contest": contest.model_dump(exclude_none=True),
            "teams": {tid: t.model_dump(exclude_none=True) for tid, t in teams.items()},
            "submissions": [s.model_dump(exclude_none=True) for s in submissions],
            "organizations": [o.model_dump(exclude_none=True) for o in organizations],
        }
