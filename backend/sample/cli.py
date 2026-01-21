import db_api as api
from getpass import getpass


def main():
    print("Welcome to the G3-GPT prototype")
    while True:
        cmd = input("G3-GPT> ").lower().strip()

        if cmd == "exit":
            break
        elif cmd == "help":
            print_help()
        elif cmd == "put":
            prompt_put()
        elif cmd == "get":  # TODO
            print("Not yet implemented")
        elif cmd == "update":  # TODO - Maybe isn't needed!
            print("Not yet implemented")
        elif cmd == "delete":
            prompt_delete()
        else:
            print("Invalid command. Type 'help' for help.")


def prompt_put():
    try:
        mode = (
            input(
                "User or document? (u/d): ",
            )
            .lower()
            .strip()
        )
        while mode not in ["u", "d", "user", "doc", "document"]:
            if mode in ["exit", "cancel"]:
                return
            print("Invalid mode. Please try again.")
            mode = input("PUT: User or document? (u/d): ").lower().strip()

        if mode in ["u", "user"]:
            name = input(" * Name: ")
            username = input(" * Username: ").strip()
            password = getpass(" * Password: ").strip()
            admin = input(" * Admin? (y/n): ").lower().strip()
            api.put_user(name, username, password, admin in ["y", "yes", "true"])
        else:
            title = input(" * Title: ")
            body = input(" * Contents: ")
            uploader_uname = input(" * Uploader (provide a username): ").strip()
            uploader = api.get_id_by_username(uploader_uname)
            while uploader is None:
                uploader_uname = input(
                    f"\t - Uploader {uploader} not found. Please try again: "
                ).strip()
                uploader = api.get_id_by_username(uploader_uname)

            req_admin = input(" * Requires admin? (y/n): ").lower().strip()
            api.put_doc(title, body, uploader, req_admin in ["y", "yes", "true"])
    except KeyboardInterrupt:
        print("\nPUT cancelled")


def prompt_delete():
    try:
        del_mode = input("User or document? (u/d): ").lower().strip()
        while del_mode not in ["u", "d", "user", "doc", "document"]:
            if del_mode in ["exit", "cancel"]:
                return
            print("Invalid mode. Please try again.")
            del_mode = input("DELETE: User or document? (u/d): ").lower().strip()

        if del_mode in ["u", "user"]:
            username = input(" * Username: ").strip()
            api.del_user(username)

        else:
            title = input(" * Title: ")
            api.del_doc(title)
    except KeyboardInterrupt:
        print("\nDELETE cancelled")


def print_help():
    print("\nput - add new document or user")
    print("get - get items based on a query")
    print("update - update an item")
    print("delete - remove an item")
    print("help - show this help page")
    print("exit - exit the program\n")


if __name__ == "__main__":
    main()
