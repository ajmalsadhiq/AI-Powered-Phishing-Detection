from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

try:
    from datasets import DatasetDict, load_dataset
except Exception:  # pragma: no cover - optional dependency fallback
    DatasetDict = None
    load_dataset = None


@dataclass
class DatasetPaths:
    train_csv: Path
    validation_csv: Path | None = None


def load_phishing_dataset(train_csv: str, validation_csv: str | None = None):
    if load_dataset is None:
        raise RuntimeError("datasets is not installed. Install training requirements first.")

    data_files = {"train": train_csv}
    if validation_csv:
        data_files["validation"] = validation_csv
    dataset = load_dataset("csv", data_files=data_files)
    if "validation" not in dataset:
        dataset = dataset["train"].train_test_split(test_size=0.2, seed=42)
        return DatasetDict({"train": dataset["train"], "validation": dataset["test"]})
    return dataset
