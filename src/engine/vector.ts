/**
 * Bitigey Vector & Matrix Mathematics Engine
 * Developed by Tunahan Haksever
 */

export interface Point2D {
  x: number;
  y: number;
}

export class Vector2D {
  constructor(public x: number = 0, public y: number = 0) {}

  add(v: Vector2D): Vector2D {
    return new Vector2D(this.x + v.x, this.y + v.y);
  }

  subtract(v: Vector2D): Vector2D {
    return new Vector2D(this.x - v.x, this.y - v.y);
  }

  multiply(scalar: number): Vector2D {
    return new Vector2D(this.x * scalar, this.y * scalar);
  }

  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2D {
    const mag = this.magnitude();
    return mag === 0 ? new Vector2D(0, 0) : this.multiply(1 / mag);
  }

  rotate(angleRad: number, center: Point2D = { x: 0, y: 0 }): Vector2D {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const dx = this.x - center.x;
    const dy = this.y - center.y;
    return new Vector2D(
      center.x + (dx * cos - dy * sin),
      center.y + (dx * sin + dy * cos)
    );
  }

  static distance(p1: Point2D, p2: Point2D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  static isPointInRotatedRect(
    point: Point2D,
    rectCenter: Point2D,
    width: number,
    height: number,
    angleRad: number
  ): boolean {
    const unrotated = new Vector2D(point.x, point.y).rotate(-angleRad, rectCenter);
    const halfW = width / 2;
    const halfH = height / 2;
    return (
      unrotated.x >= rectCenter.x - halfW &&
      unrotated.x <= rectCenter.x + halfW &&
      unrotated.y >= rectCenter.y - halfH &&
      unrotated.y <= rectCenter.y + halfH
    );
  }
}
