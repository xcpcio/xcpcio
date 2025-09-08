from typing import Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field, RootModel

from . import constants

CalculationOfPenalty = Literal[
    constants.CALCULATION_OF_PENALTY_IN_SECONDS,
    constants.CALCULATION_OF_PENALTY_IN_MINUTES,
    constants.CALCULATION_OF_PENALTY_ACCUMULATE_IN_SECONDS_AND_FINALLY_TO_THE_MINUTE,
]
TimeUnit = Literal[
    constants.TIME_UNIT_SECOND,
    constants.TIME_UNIT_MILLISECOND,
    constants.TIME_UNIT_MICROSECOND,
    constants.TIME_UNIT_NANOSECOND,
]
SubmissionStatus = Literal[
    constants.SUBMISSION_STATUS_PENDING,
    constants.SUBMISSION_STATUS_WAITING,
    constants.SUBMISSION_STATUS_PREPARING,
    constants.SUBMISSION_STATUS_COMPILING,
    constants.SUBMISSION_STATUS_RUNNING,
    constants.SUBMISSION_STATUS_JUDGING,
    constants.SUBMISSION_STATUS_FROZEN,
    #
    constants.SUBMISSION_STATUS_ACCEPTED,
    constants.SUBMISSION_STATUS_CORRECT,
    constants.SUBMISSION_STATUS_PARTIALLY_CORRECT,
    #
    constants.SUBMISSION_STATUS_REJECTED,
    constants.SUBMISSION_STATUS_WRONG_ANSWER,
    constants.SUBMISSION_STATUS_INCORRECT,
    #
    constants.SUBMISSION_STATUS_NO_OUTPUT,
    #
    constants.SUBMISSION_STATUS_COMPILATION_ERROR,
    constants.SUBMISSION_STATUS_PRESENTATION_ERROR,
    #
    constants.SUBMISSION_STATUS_RUNTIME_ERROR,
    constants.SUBMISSION_STATUS_TIME_LIMIT_EXCEEDED,
    constants.SUBMISSION_STATUS_MEMORY_LIMIT_EXCEEDED,
    constants.SUBMISSION_STATUS_OUTPUT_LIMIT_EXCEEDED,
    constants.SUBMISSION_STATUS_IDLENESS_LIMIT_EXCEEDED,
    #
    constants.SUBMISSION_STATUS_HACKED,
    #
    constants.SUBMISSION_STATUS_JUDGEMENT_FAILED,
    constants.SUBMISSION_STATUS_CONFIGURATION_ERROR,
    constants.SUBMISSION_STATUS_FILE_ERROR,
    constants.SUBMISSION_STATUS_SYSTEM_ERROR,
    constants.SUBMISSION_STATUS_CANCELED,
    constants.SUBMISSION_STATUS_SKIPPED,
    #
    constants.SUBMISSION_STATUS_SECURITY_VIOLATED,
    constants.SUBMISSION_STATUS_DENIAL_OF_JUDGEMENT,
    #
    constants.SUBMISSION_STATUS_UNKNOWN,
    constants.SUBMISSION_STATUS_UNDEFINED,
]
ImagePreset = Literal["ICPC", "CCPC", "HUNAN_CPC"]
MedalPreset = Literal["ccpc", "icpc"]
BannerMode = Literal["ONLY_BANNER", "ALL"]
DateTimeISO8601String = str


class Image(BaseModel):
    url: Optional[str] = None
    base64: Optional[str] = None
    type: Optional[Literal["png", "svg", "jpg", "jpeg"]] = None
    preset: Optional[ImagePreset] = None


class Color(BaseModel):
    color: str
    background_color: str


class Reaction(BaseModel):
    url: Optional[str] = None


class Submission(BaseModel):
    id: str = ""

    team_id: str = ""
    problem_id: int = 0
    timestamp: int = 0  # unit: seconds
    status: SubmissionStatus = constants.SUBMISSION_STATUS_UNKNOWN

    time: Optional[int] = None
    language: Optional[str] = None

    is_ignore: Optional[bool] = None

    reaction: Optional[Reaction] = None


class Submissions(RootModel[List[Submission]]):
    root: List[Submission]


class Team(BaseModel):
    id: str = ""
    name: str = ""

    organization: str = ""
    group: List[str] = Field(default_factory=list)
    tag: List[str] = Field(default_factory=list)

    coach: Optional[str] = None
    members: Optional[List[str]] = None

    badge: Optional[Image] = None

    location: Optional[str] = None
    icpc_id: Optional[str] = None

    extra: Dict[str, str] = Field(default_factory=dict)

    def add_group(self, group: str):
        if group not in self.group:
            self.group.append(group)

    def remove_group(self, group: str):
        if group in self.group:
            self.group.remove(group)


class Teams(RootModel[List[Team]]):
    pass


class ContestOptions(BaseModel):
    calculation_of_penalty: Optional[CalculationOfPenalty] = None
    submission_timestamp_unit: Optional[TimeUnit] = None
    has_reaction_videos: Optional[bool] = None
    reaction_video_url_template: Optional[str] = None


class Contest(BaseModel):
    contest_name: str = ""

    start_time: Union[int, DateTimeISO8601String] = 0
    end_time: Union[int, DateTimeISO8601String] = 0
    penalty: int = 20 * 60  # unit: seconds

    freeze_time: Optional[Union[int, DateTimeISO8601String]] = None
    frozen_time: int = 60 * 60  # unit: seconds
    unfrozen_time: int = 0x3F3F3F3F3F3F3F3F

    problem_quantity: int = 0
    problem_id: List[str] = Field(default_factory=list)

    organization: str = "School"
    status_time_display: Optional[Dict[str, bool]] = constants.FULL_STATUS_TIME_DISPLAY

    badge: Optional[str] = None
    medal: Optional[Union[Dict[str, Dict[str, int]], MedalPreset]] = None
    balloon_color: Optional[List[Color]] = None

    group: Optional[Dict[str, str]] = None
    tag: Optional[Dict[str, str]] = None

    logo: Optional[Image] = None
    banner: Optional[Image] = None
    banner_mode: Optional[BannerMode] = None
    board_link: Optional[str] = None

    version: Optional[str] = None

    options: ContestOptions = Field(default_factory=ContestOptions)

    def append_balloon_color(self, color: Color):
        if self.balloon_color is None:
            self.balloon_color = []
        self.balloon_color.append(color)
        return self

    def fill_problem_id(self):
        self.problem_id = [chr(ord("A") + i) for i in range(self.problem_quantity)]
        return self

    def fill_balloon_color(self):
        default_balloon_color_list = [
            Color(background_color="rgba(189, 14, 14, 0.7)", color="#fff"),
            Color(background_color="rgba(149, 31, 217, 0.7)", color="#fff"),
            Color(background_color="rgba(16, 32, 96, 0.7)", color="#fff"),
            Color(background_color="rgba(38, 185, 60, 0.7)", color="#000"),
            Color(background_color="rgba(239, 217, 9, 0.7)", color="#000"),
            Color(background_color="rgba(243, 88, 20, 0.7)", color="#fff"),
            Color(background_color="rgba(12, 76, 138, 0.7)", color="#fff"),
            Color(background_color="rgba(156, 155, 155, 0.7)", color="#000"),
            Color(background_color="rgba(4, 154, 115, 0.7)", color="#000"),
            Color(background_color="rgba(159, 19, 236, 0.7)", color="#fff"),
            Color(background_color="rgba(42, 197, 202, 0.7)", color="#000"),
            Color(background_color="rgba(142, 56, 54, 0.7)", color="#fff"),
            Color(background_color="rgba(144, 238, 144, 0.7)", color="#000"),
            Color(background_color="rgba(77, 57, 0, 0.7)", color="#fff"),
        ]

        self.balloon_color = default_balloon_color_list[: self.problem_quantity]

        return self
