import { useToast } from "@hooks";
import { ChangeEvent, useRef, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 100%;
  max-width: 80rem;
  overflow: hidden;
  padding: 1rem;
  box-sizing: border-box;
`;

const SlideMedia = styled.video`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 1rem;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const AddMediaButton = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 1rem;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;

  border: 2px dashed #ccc;
  color: #999;
  font-size: 2rem;

  &:hover {
    background-color: #eaeaea;
  }
`;

const ChangeButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: #85b4ff;
  color: white;
  font-size: 1rem;

  &:hover {
    background: #669aff;
  }
`;

interface DemoVideoEditorProps {
  base: string | null;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const MAX_VIDEO_SIZE_MB = 500;

const DemoVideoEditor = ({ base, handleFileChange }: DemoVideoEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const { notifySuccess, notifyError, notifyInfo } = useToast();

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // ✅ 용량 제한 검사
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
        notifyInfo(`❌ ${MAX_VIDEO_SIZE_MB}MB 이하의 영상만 업로드 가능합니다.`);
        e.target.value = "";
        return;
      }

      // ✅ MIME 타입 확인 (선택사항)
      if (!file.type.startsWith("video/")) {
        notifyInfo("❌ 영상 파일만 업로드 가능합니다.");
        e.target.value = "";
        return;
      }

      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      handleFileChange(e);

      e.target.value = ""; // 동일 파일 재선택 가능하도록 초기화

      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  };

  return (
    <Wrapper>
      {videoSrc || base ? (
        <>
          <SlideMedia ref={videoRef} controls>
            <source src={videoSrc || (typeof base === "string" ? base : "")} type="video/mp4" />
            Your browser does not support the video tag.
          </SlideMedia>
          <ChangeButton onClick={openFileInput}>영상 수정</ChangeButton>
        </>
      ) : (
        <AddMediaButton onClick={openFileInput}>+</AddMediaButton>
      )}
      <HiddenFileInput
        name="demoVideo"
        ref={fileInputRef}
        type="file"
        accept=".mkv,.mp4,.avi"
        onChange={onFileChange}
      />
    </Wrapper>
  );
};

export default DemoVideoEditor;

// import { ChangeEvent, useRef, useState } from "react";
// import styled from "styled-components";

// const Wrapper = styled.div`
//   width: 100%;
//   max-width: 80rem;
//   overflow: hidden;
//   padding: 1rem;
//   box-sizing: border-box;
// `;

// const SlideMedia = styled.video`
//   width: 100%;
//   aspect-ratio: 16 / 9;
//   object-fit: cover;
//   border-radius: 1rem;
// `;

// const HiddenFileInput = styled.input`
//   display: none;
// `;

// const AddMediaButton = styled.div`
//   width: 100%;
//   aspect-ratio: 16 / 9;
//   border-radius: 1rem;
//   background-color: #f5f5f5;
//   display: flex;
//   align-items: center;
//   justify-content: center;

//   border: 2px dashed #ccc;
//   color: #999;
//   font-size: 2rem;

//   &:hover {
//     background-color: #eaeaea;
//   }
// `;

// const ChangeButton = styled.button`
//   margin-top: 1rem;
//   padding: 0.5rem 1rem;
//   border: none;
//   border-radius: 0.5rem;
//   background: #85b4ff;
//   color: white;

//   font-size: 1rem;

//   &:hover {
//     background: #669aff;
//   }
// `;

// interface DemoVideoEditorProps {
//   base: string | null;
//   handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
// }

// const MAX_VIDEO_SIZE_MB = 100;

// const DemoVideoEditor = ({ base, handleFileChange }: DemoVideoEditorProps) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const [videoSrc, setVideoSrc] = useState<string | null>(null);

//   const openFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const file = e.target.files[0];
//       const url = URL.createObjectURL(file);
//       setVideoSrc(url);
//       handleFileChange(e);

//       // 파일 입력 초기화 (동일 파일 재선택 시에도 onChange 발생)
//       e.target.value = "";

//       // 새 비디오 URL 적용 후 강제로 로드
//       if (videoRef.current) {
//         videoRef.current.load();
//       }
//     }
//   };

//   return (
//     <Wrapper>
//       {videoSrc || base ? (
//         <>
//           <SlideMedia ref={videoRef} controls>
//             <source src={videoSrc || (typeof base === "string" ? base : "")} type="video/mp4" />
//             Your browser does not support the video tag.
//           </SlideMedia>
//           <ChangeButton onClick={openFileInput}>영상 수정</ChangeButton>
//         </>
//       ) : (
//         <AddMediaButton onClick={openFileInput}>+</AddMediaButton>
//       )}
//       <HiddenFileInput
//         name="demoVideo"
//         ref={fileInputRef}
//         type="file"
//         accept=".mkv,.mp4,.avi"
//         onChange={onFileChange}
//       />
//     </Wrapper>
//   );
// };

// export default DemoVideoEditor;
