import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { postAuth } from "@api/auth";
import { setAuth } from "@store/reducers/auth";
import { validateEmail } from "@utils/validate";
import { Icon } from "./Icon";
import styles from "./LoginDialog.module.css";

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

/** 관리자·팀 계정 로그인. 네이티브 dialog로 포커스 가두기와 ESC 닫기를 처리한다. */
export const LoginDialog = ({ open, onClose }: LoginDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("이메일 형식을 확인하세요.");
      return;
    }
    setPending(true);
    setError("");
    try {
      dispatch(setAuth(await postAuth(email, password)));
      setPassword("");
      onClose();
    } catch {
      setError("이메일 또는 비밀번호를 확인하세요.");
    } finally {
      setPending(false);
    }
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="login-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.head}>
          <h2 id="login-title" className={styles.title}>
            <Icon name="lock" size={22} />
            관리자 로그인
          </h2>
          <button type="button" className={styles.close} aria-label="닫기" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </div>
        <p className={styles.desc}>전시 관리자와 작품을 수정하는 팀만 사용합니다. 관람객은 로그인 없이 모든 작품을 볼 수 있습니다.</p>
        <label className={styles.field}>
          이메일
          <input
            className={styles.input}
            type="email"
            autoComplete="username"
            placeholder="example@sungkyul.ac.kr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className={styles.field}>
          비밀번호
          <input
            className={styles.input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
            required
          />
        </label>
        {error && (
          <p id="login-error" role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <button type="submit" className={styles.submit} disabled={pending}>
          <Icon name="login" size={18} />
          {pending ? "로그인 중" : "로그인"}
        </button>
      </form>
    </dialog>
  );
};
