#!/usr/bin/env python3
"""Set EXPO_TOKEN GitHub secret via API. Requires GH_TOKEN env var with repo scope."""
import base64
import json
import os
import sys
import urllib.request

try:
    from nacl import encoding, public
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "pynacl"])
    from nacl import encoding, public

REPO = "vijayshagara/Task_Management_Portal-mobile"
SECRET_NAME = "EXPO_TOKEN"


def api(method, path, data=None, token=None):
    token = token or os.environ["GH_TOKEN"]
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        data=json.dumps(data).encode() if data else None,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())


def encrypt(public_key: str, secret_value: str) -> str:
    pk = public.PublicKey(public_key.encode(), encoding.Base64Encoder())
    sealed = public.SealedBox(pk).encrypt(secret_value.encode(), encoding.Base64Encoder())
    return sealed.decode()


def main():
    if len(sys.argv) < 2:
        print("Usage: GH_TOKEN=... python3 set-expo-secret.py <EXPO_TOKEN>", file=sys.stderr)
        sys.exit(1)
    if "GH_TOKEN" not in os.environ:
        print("GH_TOKEN environment variable required (GitHub PAT with repo scope).", file=sys.stderr)
        sys.exit(1)

    expo_token = sys.argv[1].strip()
    owner, repo = REPO.split("/")
    key_data = api("GET", f"/repos/{owner}/{repo}/actions/secrets/public-key")
    encrypted = encrypt(key_data["key"], expo_token)
    api(
        "PUT",
        f"/repos/{owner}/{repo}/actions/secrets/{SECRET_NAME}",
        {"encrypted_value": encrypted, "key_id": key_data["key_id"]},
    )
    print(f"Set {SECRET_NAME} on {REPO}")


if __name__ == "__main__":
    main()
