import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerWrap = styled.div<{ full?: boolean }>`
  ${({ full }) =>
    full
      ? `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.5);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `
      : `
    display: inline-block;
  `}
`;

const SpinnerCircle = styled.div`
  width: 2rem;
  height: 2rem;
  border: 0.25rem solid #ccc;
  border-top-color: #0070f3;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;

const ProgressText = styled.div`
  margin-top: 1rem;
  font-size: 1rem;
  color: #333;
`;

interface SpinnerProps {
  progress?: number;
  full?: boolean;
}

export default function Spinner({ progress, full = true }: SpinnerProps) {
  return (
    <SpinnerWrap full={full}>
      <SpinnerCircle />
      {Number.isFinite(progress) && typeof progress === "number" && (
        <ProgressText>{Math.min(100, Math.round(progress))}%</ProgressText>
      )}
    </SpinnerWrap>
  );

  // return (
  //   <SpinnerWrap full={full}>
  //     <SpinnerCircle />
  //     {typeof progress === "number" && <ProgressText>{progress}%</ProgressText>}
  //   </SpinnerWrap>
  // );
}

// import styled, { keyframes } from "styled-components";

// const spin = keyframes`
//   to {
//     transform: rotate(360deg);
//   }
// `;

// const SpinnerWrap = styled.div<{ full?: boolean }>`
//   ${({ full }) =>
//     full
//       ? `
//     position: fixed;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     background: rgba(255,255,255,0.5);
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     z-index: 9999;
//   `
//       : `
//     display: inline-block;
//   `}
// `;

// const SpinnerCircle = styled.div`
//   width: 2rem;
//   height: 2rem;
//   border: 0.25rem solid #ccc;
//   border-top-color: #0070f3;
//   border-radius: 50%;
//   animation: ${spin} 0.7s linear infinite;
// `;

// export default function Spinner() {
//   return (
//     <SpinnerWrap full={true}>
//       <SpinnerCircle />
//     </SpinnerWrap>
//   );
// }
