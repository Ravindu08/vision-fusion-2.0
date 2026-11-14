from enum import Enum
from typing import Dict, Any, List


class CharacterStage(str, Enum):
    THE_RECRUIT = "The Recruit"
    THE_BUILDER = "The Builder"
    THE_PATHFINDER = "The Pathfinder"
    THE_INTELLIGENCE_OPERATIVE = "The Intelligence Operative"
    THE_VANGUARD = "The Vanguard"


class CharacterPose(str, Enum):
    IDLE = "idle"
    ACTIVE = "active"
    CELEBRATING = "celebrating"
    QUIZZING = "quizzing"
    FOCUSED = "focused"


# Evolution Stage Definitions
# Stage thresholds are percentages of Total Possible XP (default: 1000 XP)
STAGE_DEFINITIONS: List[Dict[str, Any]] = [
    {
        "stage": CharacterStage.THE_RECRUIT,
        "slug": "recruit",
        "min_percent": 0.0,
        "max_percent": 19.99,
        "title": "The Recruit",
        "tagline": "Initiating the career journey",
        "description": "Every master begins as an apprentice. You have stepped into the technology arena.",
    },
    {
        "stage": CharacterStage.THE_BUILDER,
        "slug": "builder",
        "min_percent": 20.0,
        "max_percent": 39.99,
        "title": "The Builder",
        "tagline": "Forging core technical skills",
        "description": "Assembling components, learning architectural patterns, and constructing modern solutions.",
    },
    {
        "stage": CharacterStage.THE_PATHFINDER,
        "slug": "pathfinder",
        "min_percent": 40.0,
        "max_percent": 59.99,
        "title": "The Pathfinder",
        "tagline": "Navigating modern tech horizons",
        "description": "Career paths are unfolding. You have officially unlocked certificate eligibility!",
    },
    {
        "stage": CharacterStage.THE_INTELLIGENCE_OPERATIVE,
        "slug": "intelligence-operative",
        "min_percent": 60.0,
        "max_percent": 79.99,
        "title": "The Intelligence Operative",
        "tagline": "Mastering analytics and high-level strategy",
        "description": "Extracting insights, decoding challenges, and performing at peak problem-solving speed.",
    },
    {
        "stage": CharacterStage.THE_VANGUARD,
        "slug": "vanguard",
        "min_percent": 80.0,
        "max_percent": 100.0,
        "title": "The Vanguard",
        "tagline": "At the forefront of technical innovation",
        "description": "The pinnacle of Vision Fusion 2.0. A proven leader in tech career readiness.",
    },
]


def calculate_character_stage(current_xp: int, total_possible_xp: int = 1000) -> Dict[str, Any]:
    """Calculate character stage and progression metrics based on current XP."""
    if total_possible_xp <= 0:
        total_possible_xp = 1000

    percent = (current_xp / total_possible_xp) * 100.0
    
    current_stage_info = STAGE_DEFINITIONS[0]
    next_stage_info = None

    for idx, stage in enumerate(STAGE_DEFINITIONS):
        if percent >= stage["min_percent"]:
            current_stage_info = stage
            if idx + 1 < len(STAGE_DEFINITIONS):
                next_stage_info = STAGE_DEFINITIONS[idx + 1]
            else:
                next_stage_info = None

    # Calculate XP to next stage
    xp_to_next = 0
    next_stage_threshold_xp = total_possible_xp
    stage_progress_percent = 100.0

    if next_stage_info:
        next_stage_threshold_xp = int((next_stage_info["min_percent"] / 100.0) * total_possible_xp)
        xp_to_next = max(0, next_stage_threshold_xp - current_xp)
        current_stage_min_xp = int((current_stage_info["min_percent"] / 100.0) * total_possible_xp)
        stage_xp_range = max(1, next_stage_threshold_xp - current_stage_min_xp)
        stage_progress_percent = min(100.0, max(0.0, ((current_xp - current_stage_min_xp) / stage_xp_range) * 100.0))

    return {
        "current_stage": current_stage_info["stage"],
        "stage_slug": current_stage_info["slug"],
        "title": current_stage_info["title"],
        "tagline": current_stage_info["tagline"],
        "description": current_stage_info["description"],
        "current_xp": current_xp,
        "total_possible_xp": total_possible_xp,
        "overall_percent": round(percent, 1),
        "stage_progress_percent": round(stage_progress_percent, 1),
        "next_stage": next_stage_info["stage"] if next_stage_info else None,
        "next_stage_title": next_stage_info["title"] if next_stage_info else "Max Stage Reached",
        "xp_to_next_stage": xp_to_next,
        "is_certificate_eligible": percent >= 35.0,
    }

