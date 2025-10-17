"""
Routes package for Contest API Server

Contains all API route definitions organized by functionality.
"""

from fastapi import APIRouter

from . import (
    access,
    accounts,
    awards,
    clarifications,
    contests,
    general,
    groups,
    judgement_types,
    judgements,
    languages,
    organizations,
    problems,
    runs,
    submissions,
    teams,
)


def create_router() -> APIRouter:
    """Create and configure the main API router"""
    router = APIRouter(prefix="/api")

    # Include all route modules
    router.include_router(access.router, tags=["Access"])
    router.include_router(accounts.router, tags=["Accounts"])
    router.include_router(awards.router, tags=["Awards"])
    router.include_router(clarifications.router, tags=["Clarifications"])
    router.include_router(contests.router, tags=["Contests"])
    router.include_router(general.router, tags=["General"])
    router.include_router(groups.router, tags=["Groups"])
    router.include_router(judgements.router, tags=["Judgements"])
    router.include_router(judgement_types.router, tags=["Judgement types"])
    router.include_router(languages.router, tags=["Languages"])
    router.include_router(organizations.router, tags=["Organizations"])
    router.include_router(problems.router, tags=["Problems"])
    router.include_router(runs.router, tags=["Runs"])
    router.include_router(submissions.router, tags=["Submissions"])
    router.include_router(teams.router, tags=["Teams"])

    return router


__all__ = [create_router]
