# TaskFlow

TaskFlow is a task manager for small teams: one shared list per project, an owner and a date on every task, and a calm
Today view for each person. This repository is the product website and app, used as the staging app that
[Verixa](https://github.com/verixaoffical-spec/verixa-uni) tests.

## Run it

You need Python 3.10 or newer. Nothing else.

```powershell
python server.py          # http://127.0.0.1:4000
```

Sign in with `demo@taskflow.test` and the password `Taskflow123!`.

## What is where

| Folder | What is in it |
|---|---|
| `server.py` | The web server: pages, API routes and error handling |
| `src/pricing` | Plans and prices |
| `src/contact` | Messages from the contact form |
| `src/auth` | Signing in |
| `src/profile` | Signed-in user profile |
| `src/tasks` | Each person's task list |
| `site/` | The pages, the layout and the styles |
| `tests/ui` | Playwright screen tests |
| `tests/api` | The Postman collection for the API |

## The API

| Method | Path | Answer |
|---|---|---|
| GET | `/health` | `{"ok": true}` |
| GET | `/api/plans` | Each plan with its monthly and yearly price |
| POST | `/api/contact` | 201, or 400 when a field is missing |
| POST | `/api/auth/login` | 200 with a token, or 401 |
| GET | `/api/profile` | Signed-in user's profile. Needs `Authorization: Bearer <token>` |
| GET, POST | `/api/tasks` | Your tasks. Needs `Authorization: Bearer <token>` |

## Showing Verixa with this repository

Each pull request below changes one part of TaskFlow. Open them one at a time, and Verixa scores each one when it opens.

| Branch | What it changes | Risk Verixa should give | What a run finds |
|---|---|---|---|
| `docs/readme-wording` | Wording in this README | Low | Nothing, every test passes |
| `tasks/longer-titles` | Task titles can be 500 characters | Low or Medium | Nothing, every test passes |
| `pricing/full-price-yearly-invoices` | Yearly price drops the 20% discount | High (pricing code) | 2 real bugs: the pricing screen test and the API test "List plans" |
| `contact/keep-messages-on-disk` | Saves messages to a file in a folder that does not exist | Medium | 2 real bugs: the contact form fails with a server error |
| `docs/add-docs-page` | Adds the Docs page | Low | The Docs test stops being "deployment pending" and passes |

**To show a pull request on staging,** run the branch: `git checkout <branch>`, then `python server.py`. Verixa tests the
running staging app, so a bug is found only once its branch is running. Before that, a page that is not there yet is
reported as deployment pending, not as a bug.

**The demo, step by step**

1. In Verixa, link this repository and your Jira project on **Integrations**, and save the staging address
   `http://127.0.0.1:4000`.
2. In the **Test Library**, upload `tests/ui/taskflow.spec.ts`, `tests/ui/docs.spec.ts` and, on the Postman tab,
   `tests/api/taskflow.postman_collection.json`.
3. Open the pull request for `pricing/full-price-yearly-invoices` on GitHub. It appears on **Risk Analysis** as High risk.
4. Run that branch as staging, then press **Run Now**. Verixa finds the pricing bug from the screen and from the API, with
   a screenshot, a trace and logs, and drafts a Jira ticket.
5. Approve the ticket. It is filed in Jira with the proof attached.
6. Run `main` again as staging and press **Run Now** once more: everything passes.
