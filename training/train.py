from __future__ import annotations

from pathlib import Path

try:
    import torch
    from transformers import (
        DistilBertForSequenceClassification,
        DistilBertTokenizerFast,
        Trainer,
        TrainingArguments,
    )
except Exception:  # pragma: no cover - optional dependency fallback
    torch = None
    DistilBertForSequenceClassification = None
    DistilBertTokenizerFast = None
    Trainer = None
    TrainingArguments = None

from config import TrainingConfig
from dataset import load_phishing_dataset


def tokenize_dataset(dataset, tokenizer, max_length: int):
    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            padding="max_length",
            truncation=True,
            max_length=max_length,
        )

    tokenized = dataset.map(tokenize_function, batched=True)
    if "label" in tokenized["train"].column_names:
        tokenized = tokenized.rename_column("label", "labels")
    tokenized.set_format("torch", columns=[column for column in ["input_ids", "attention_mask", "labels"] if column in tokenized["train"].column_names or column == "labels"])
    return tokenized


def main():
    config = TrainingConfig()
    dataset = load_phishing_dataset("phishing_emails.csv")
    if DistilBertTokenizerFast is None or DistilBertForSequenceClassification is None or Trainer is None or TrainingArguments is None:
        raise RuntimeError("transformers is not installed. Install training requirements first.")

    tokenizer = DistilBertTokenizerFast.from_pretrained(config.model_name)
    tokenized = tokenize_dataset(dataset, tokenizer, config.max_length)

    model = DistilBertForSequenceClassification.from_pretrained(config.model_name, num_labels=config.num_labels)

    training_args = TrainingArguments(
        output_dir=config.output_dir,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=config.learning_rate,
        per_device_train_batch_size=config.batch_size,
        per_device_eval_batch_size=config.batch_size,
        num_train_epochs=config.num_epochs,
        weight_decay=config.weight_decay,
        load_best_model_at_end=True,
        logging_steps=25,
        report_to=[],
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["validation"],
    )

    trainer.train()
    Path(config.model_output_dir).mkdir(parents=True, exist_ok=True)
    model.save_pretrained(config.model_output_dir)
    tokenizer.save_pretrained(config.model_output_dir)
    print(f"Saved model to {config.model_output_dir}")


if __name__ == "__main__":
    main()
