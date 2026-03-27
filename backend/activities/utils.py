import re


def normalize_answer(value):
    if value is None:
        return ''

    value = str(value).strip().lower()
    value = value.replace(',', '.')
    value = re.sub(r'\s+', ' ', value)
    return value


def is_answer_correct(submitted_answer, correct_answer):
    submitted = normalize_answer(submitted_answer)
    correct = normalize_answer(correct_answer)
    return submitted == correct