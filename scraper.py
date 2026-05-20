"""
scraper.py — Pulls David Rejeski's existing portfolio pieces into folders.

Usage:
    pip install requests beautifulsoup4
    python scraper.py

Output:
    ./pieces/
        stuhl/
            info.txt
            01_designmuseumopening.jpeg
            02_rejeskichair.jpeg
            03_chair1.jpg
            ...
        book-stand/
            info.txt
            01_...
        ...

Each info.txt looks like:

    Title: Stuhl
    Source: https://www.davidrejeski.com/stuhl/
    Materials: Zebrawood, Black Walnut, Cocobolo

    Chair on display at the German Design Museum, Berlin...

Edit info.txt by hand if anything needs cleaning up.
"""

import os
import re
import sys
import time
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Missing dependencies. Run: pip install requests beautifulsoup4")
    sys.exit(1)

BASE_URL = "https://www.davidrejeski.com"
HOMEPAGE = BASE_URL + "/"
OUTPUT_DIR = "pieces"

# Pages on the sidebar that aren't actually pieces — skip these
NON_PIECE_PATHS = {
    "/",
    "/older-work/",
    "/tools-process/",
    "/essays-on-art/",
    "/music/",
    "/news/",
    "/sketches/",
}

REQUEST_DELAY_SECONDS = 0.5

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/126.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def fetch_html(url: str) -> BeautifulSoup:
    time.sleep(REQUEST_DELAY_SECONDS)
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")


def download_file(url: str, dest_path: str) -> bool:
    """Download a binary file. Returns True on success."""
    try:
        time.sleep(REQUEST_DELAY_SECONDS)
        resp = requests.get(url, headers=HEADERS, timeout=60, stream=True)
        resp.raise_for_status()
        with open(dest_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"      Failed to download {url}: {e}")
        return False


def get_piece_urls() -> list[tuple[str, str]]:
    """Scrape homepage sidebar for piece links."""
    soup = fetch_html(HOMEPAGE)
    pieces = []
    seen = set()

    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        parsed = urlparse(href)
        path = parsed.path

        if not path.startswith("/"):
            continue
        if not path.endswith("/"):
            path += "/"

        if parsed.netloc and parsed.netloc not in ("www.davidrejeski.com", "davidrejeski.com"):
            continue
        if path in NON_PIECE_PATHS:
            continue
        if path in seen:
            continue
        if path.startswith("/site/") or "#" in href:
            continue

        seen.add(path)
        name = a.get_text(strip=True)
        if not name:
            continue
        pieces.append((name, urljoin(BASE_URL, path)))

    return pieces


def slug_from_url(url: str) -> str:
    return urlparse(url).path.strip("/").split("/")[-1]


def extract_largest_image_url(img_tag, link_tag) -> str:
    """
    ProcessWire pattern:
        thumbnail: foo.640x0.250x0.jpg
        larger:    foo.640x0.jpg   <-- this is the link target
    """
    if link_tag and link_tag.get("href"):
        href = link_tag["href"]
        if href.startswith("/"):
            href = urljoin(BASE_URL, href)
        if re.search(r"\.(jpe?g|png|gif|webp)$", href, re.IGNORECASE):
            return href

    src = img_tag.get("src", "")
    if src.startswith("/"):
        src = urljoin(BASE_URL, src)
    return src


def clean_image_filename(url: str, index: int) -> str:
    """Make a tidy filename: 01_originalname.jpg"""
    name = os.path.basename(urlparse(url).path)
    # Strip the ProcessWire size suffixes like .640x0
    name = re.sub(r"\.\d+x\d+", "", name)
    return f"{index:02d}_{name}"


def scrape_piece(url: str, fallback_name: str) -> dict:
    """Scrape a single piece page."""
    soup = fetch_html(url)

    h1 = soup.find("h1")
    title = h1.get_text(strip=True) if h1 else fallback_name

    body_text_parts = []
    image_urls = []

    if h1:
        container = h1.parent
        capture = False
        for el in container.descendants:
            if el is h1:
                capture = True
                continue
            if not capture:
                continue
            if getattr(el, "name", None) == "p":
                txt = el.get_text(" ", strip=True)
                if txt:
                    body_text_parts.append(txt)
            if getattr(el, "name", None) == "img":
                src = el.get("src", "")
                if "icon.jpeg" in src or "/templates/styles/" in src:
                    continue
                link = el.find_parent("a")
                full_url = extract_largest_image_url(el, link)
                if full_url and full_url not in image_urls:
                    image_urls.append(full_url)

    # Pull "Woods: X, Y" line out for the materials field
    materials_line = ""
    description_lines = []
    for line in body_text_parts:
        m = re.match(r"^\s*Woods?\s*[:\-]\s*(.+)$", line, re.IGNORECASE)
        if m and not materials_line:
            materials_line = m.group(1).strip()
        else:
            description_lines.append(line)

    return {
        "title": title,
        "source_url": url,
        "materials": materials_line,
        "description": "\n\n".join(description_lines).strip(),
        "image_urls": image_urls,
    }


def write_piece_folder(piece_data: dict, slug: str):
    """Create folder with info.txt and downloaded images."""
    folder = os.path.join(OUTPUT_DIR, slug)
    os.makedirs(folder, exist_ok=True)

    # Write info.txt
    info_path = os.path.join(folder, "info.txt")
    with open(info_path, "w", encoding="utf-8") as f:
        f.write(f"Title: {piece_data['title']}\n")
        f.write(f"Source: {piece_data['source_url']}\n")
        if piece_data["materials"]:
            f.write(f"Materials: {piece_data['materials']}\n")
        f.write("\n")
        if piece_data["description"]:
            f.write(piece_data["description"])
            f.write("\n")

    # Download images
    for i, img_url in enumerate(piece_data["image_urls"], start=1):
        filename = clean_image_filename(img_url, i)
        dest = os.path.join(folder, filename)
        if os.path.exists(dest):
            continue  # skip if already downloaded
        download_file(img_url, dest)


def main():
    print(f"Scraping piece list from {HOMEPAGE}...")
    pieces = get_piece_urls()
    print(f"Found {len(pieces)} pieces.\n")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for i, (name, url) in enumerate(pieces, start=1):
        slug = slug_from_url(url)
        print(f"[{i:>2}/{len(pieces)}] {name} -> {slug}/")
        try:
            data = scrape_piece(url, fallback_name=name)
            print(f"      {len(data['image_urls'])} image(s)")
            write_piece_folder(data, slug)
        except Exception as e:
            print(f"      ERROR: {e}")

    print(f"\nDone. Output is in ./{OUTPUT_DIR}/")


if __name__ == "__main__":
    main()
