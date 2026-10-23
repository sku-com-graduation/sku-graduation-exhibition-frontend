import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Marquee.module.css";

interface MarqueeProps {
  /** 1초에 움직이는 픽셀 */
  speed: number;
  direction?: "left" | "right";
  children: ReactNode;
  label: string;
}

const SLOW_RATIO = 0.25;

/**
 * 끝없이 흐르는 가로 띠. 같은 내용을 두 번 그려 절반 너비마다 이음새 없이 돌아온다.
 * 마우스를 올리거나 포커스가 들어오면 멈추지 않고 25% 속도로 서서히 감속한다.
 * 동작 줄이기 설정에서는 움직이지 않고 가로 스크롤로 바뀐다(CSS).
 */
export const Marquee = ({ speed, direction = "left", children, label }: MarqueeProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const track = trackRef.current;
    if (!box || !track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let x = 0;
    let current = speed;
    let target = speed;
    let last = 0;
    let frame = 0;
    const slow = () => (target = speed * SLOW_RATIO);
    const resume = () => (target = speed);

    const tick = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      current += (target - current) * Math.min(1, dt * 3);
      const half = track.scrollWidth / 2;
      if (half > 0) x = (x + current * dt) % half;
      track.style.transform = `translateX(${direction === "left" ? -x : x - half}px)`;
      frame = requestAnimationFrame(tick);
    };

    box.addEventListener("pointerenter", slow);
    box.addEventListener("pointerleave", resume);
    box.addEventListener("focusin", slow);
    box.addEventListener("focusout", resume);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      box.removeEventListener("pointerenter", slow);
      box.removeEventListener("pointerleave", resume);
      box.removeEventListener("focusin", slow);
      box.removeEventListener("focusout", resume);
    };
  }, [speed, direction]);

  return (
    <div ref={boxRef} className={styles.box} role="region" aria-label={label}>
      <div ref={trackRef} className={styles.track}>
        <div className={styles.group}>{children}</div>
        <div className={styles.group} aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
};
