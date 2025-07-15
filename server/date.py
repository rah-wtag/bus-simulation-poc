from datetime import datetime, timedelta


def parse_gtfs_time(time_str: str, base_date: datetime) -> datetime:
    parts = time_str.split(":")
    hour = int(parts[0])
    minute = int(parts[1])
    second = int(parts[2])

    # Calculate how many days to add (if hour is 24 or more)
    days_to_add = hour // 24
    # Calculate the actual hour for the new day
    actual_hour = hour % 24

    # Start with the base date and add the extra days
    final_date = base_date.date() + timedelta(days=days_to_add)

    # Create the final datetime object
    return datetime(
        year=final_date.year,
        month=final_date.month,
        day=final_date.day,
        hour=actual_hour,
        minute=minute,
        second=second,
    )
