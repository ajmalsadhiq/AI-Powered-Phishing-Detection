from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TrainingConfig:
    model_name: str = "distilbert-base-uncased"
    max_length: int = 512
    num_labels: int = 2
    batch_size: int = 16
    learning_rate: float = 2e-5
    num_epochs: int = 3
    weight_decay: float = 0.01
    output_dir: str = "./results"
    model_output_dir: str = "./phishing_model"
