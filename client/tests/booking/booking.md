# Booking demo checks

- **Preselection:** selecting an acrylic service opens the booking form with that service; an unknown query value remains unselected.
- **Validation:** empty submission focuses the name field; malformed email and past dates expose associated field errors and never confirm.
- **Local-only success:** a valid submission shows the explicit no-booking/no-email disclosure, creates no requests or storage entries, and clears name and email.
- **Local date boundary:** at 00:30 UTC on September 7 in Los Angeles, September 6 remains selectable and is displayed without a timezone shift.

All scenarios run at desktop and mobile viewport sizes using sample personal details.
