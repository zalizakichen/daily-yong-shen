"""Rebuild a text-free background from the original artwork."""

from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "public" / "background.original.png"
OUTPUT = ROOT / "public" / "background.png"


def read_rgb(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert("RGB"))


def write_rgb(path: Path, img: np.ndarray) -> None:
    Image.fromarray(img).save(path, optimize=True)


def edge_gradient(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    left = img[:, 6:18].astype(np.float32).mean(axis=1)
    right = img[:, w - 18 : w - 6].astype(np.float32).mean(axis=1)
    xs = np.linspace(0, 1, w, dtype=np.float32)
    gradient = np.zeros_like(img, dtype=np.float32)
    for x, t in enumerate(xs):
        gradient[:, x] = left * (1 - t) + right * t
    return gradient.astype(np.uint8)


def smoothstep(y0: float, y1: float, h: int) -> np.ndarray:
    ys = np.linspace(0, 1, h, dtype=np.float32)
    t = np.clip((ys - y0) / max(y1 - y0, 1e-6), 0, 1)
    return (t * t * (3 - 2 * t)).astype(np.float32)


def build_clean_background(img: np.ndarray) -> np.ndarray:
    h, w = img.shape[:2]
    gradient = edge_gradient(img)

    # Upper sky: pure reconstructed gradient (no baked text).
    sky_end = int(h * 0.52)
    cleaned = img.copy()
    cleaned[:sky_end, :] = gradient[:sky_end, :]

    # Horizon band: blend original scenery back in.
    blend = smoothstep(0.46, 0.62, h)[:, None, None]
    cleaned = (
        gradient.astype(np.float32) * (1 - blend) + img.astype(np.float32) * blend
    ).astype(np.uint8)

    # Remove lower UI copy while keeping silhouette on the right.
    footer_start = int(h * 0.67)
    footer_blend = smoothstep(0.67, 0.78, h)[footer_start:, None, None]
    cleaned[footer_start:, :] = (
        gradient[footer_start:, :].astype(np.float32) * footer_blend
        + cleaned[footer_start:, :].astype(np.float32) * (1 - footer_blend)
    ).astype(np.uint8)

    # Local inpaint for residual bright glyphs in the middle/footer.
    gray = cv2.cvtColor(cleaned, cv2.COLOR_RGB2GRAY)
    mask = np.zeros((h, w), dtype=np.uint8)
    bright = gray > 70
    mask[bright] = 255

    footer_band = np.zeros((h, w), dtype=bool)
    footer_band[int(h * 0.68) : int(h * 0.84), int(w * 0.12) : int(w * 0.88)] = True
    mask[footer_band] = 255

    center_band = np.zeros((h, w), dtype=bool)
    center_band[int(h * 0.14) : int(h * 0.56), int(w * 0.05) : int(w * 0.95)] = True
    mask[center_band] = 255

    silhouette = np.zeros((h, w), dtype=bool)
    silhouette[int(h * 0.58) :, int(w * 0.45) :] = True
    mask[silhouette & (gray < 72)] = 0

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask = cv2.dilate(mask, kernel, iterations=2)

    bgr = cv2.cvtColor(cleaned, cv2.COLOR_RGB2BGR)
    inpainted = cv2.inpaint(bgr, mask, 11, cv2.INPAINT_NS)
    result = cv2.cvtColor(inpainted, cv2.COLOR_BGR2RGB)

    # Final soft merge with gradient in text-heavy zones.
    text_zone = np.zeros((h, w), dtype=np.float32)
    text_zone[: int(h * 0.56), :] = 1
    text_zone[int(h * 0.68) : int(h * 0.83), int(w * 0.1) : int(w * 0.9)] = 1
    text_zone = cv2.GaussianBlur(text_zone, (0, 0), 18)
    text_zone = text_zone[..., None]

    final = (
        gradient.astype(np.float32) * text_zone
        + result.astype(np.float32) * (1 - text_zone)
    ).astype(np.uint8)
    return final


def main() -> None:
    if not ORIGINAL.exists():
        raise FileNotFoundError(f"Missing original background: {ORIGINAL}")

    source = read_rgb(ORIGINAL)
    cleaned = build_clean_background(source)
    write_rgb(OUTPUT, cleaned)
    print(f"Saved text-free background to {OUTPUT}")


if __name__ == "__main__":
    main()
