from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, path):
    # Create a square icon with the theme color and a shopping bag emoji-like design
    img = Image.new('RGBA', (size, size), (108, 92, 231, 255))  # #6C5CE7
    draw = ImageDraw.Draw(img)
    
    # Draw a simple shopping bag icon in white
    bag_w = int(size * 0.6)
    bag_h = int(size * 0.65)
    bx = (size - bag_w) // 2
    by = (size - bag_h) // 2
    
    # Bag body (rounded rect approximation)
    draw.rounded_rectangle(
        [bx, by + int(bag_h * 0.15), bx + bag_w, by + bag_h],
        radius=int(size * 0.08),
        fill=(255, 255, 255, 255)
    )
    
    # Bag handle (left)
    draw.arc(
        [bx + int(bag_w * 0.2), by - int(bag_h * 0.15), bx + int(bag_w * 0.45), by + int(bag_h * 0.2)],
        start=180, end=360,
        fill=(255, 255, 255, 255),
        width=max(2, int(size * 0.05))
    )
    
    # Bag handle (right)
    draw.arc(
        [bx + int(bag_w * 0.55), by - int(bag_h * 0.15), bx + int(bag_w * 0.8), by + int(bag_h * 0.2)],
        start=180, end=360,
        fill=(255, 255, 255, 255),
        width=max(2, int(size * 0.05))
    )
    
    img.save(path, 'PNG')

os.makedirs('public', exist_ok=True)

create_icon(192, 'public/icons-192.png')
create_icon(512, 'public/icons-512.png')

print("Icons created successfully!")
print(f"   - public/icons-192.png (192x192)")
print(f"   - public/icons-512.png (512x512)")
