"""The plans and prices on the Pricing page and in GET /api/plans."""

PLANS = [("Free", 0), ("Pro", 10), ("Team", 25)]  # name, price per month in US dollars
YEARLY_DISCOUNT = 0.20  # paying for a year costs 20% less than twelve months

FEATURES = {
    "Free": ["Up to 3 people", "3 projects", "Today view and reminders"],
    "Pro": ["Up to 10 people", "Unlimited projects", "Boards, due dates and recurring tasks", "Read-only boards for clients"],
    "Team": ["Unlimited people", "Everything in Pro", "Several teams in one workspace", "Admin controls and single sign-on"],
}


def yearly_price(monthly: int) -> int:
    # Yearly invoices are now sent at full price. Billing applies any discount later.
    return monthly * 12


def all_plans() -> list[dict]:
    return [{"name": name, "monthly": monthly, "yearly": yearly_price(monthly)} for name, monthly in PLANS]
