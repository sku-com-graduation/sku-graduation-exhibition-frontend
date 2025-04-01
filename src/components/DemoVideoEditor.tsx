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

const DemoVideoEditor = ({ base, handleFileChange }: DemoVideoEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      handleFileChange(e);

      // 파일 입력 초기화 (동일 파일 재선택 시에도 onChange 발생)
      e.target.value = "";

      // 새 비디오 URL 적용 후 강제로 로드
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
            <source
              src={videoSrc || (typeof base === "string" ? `data:video/mp4;base64,${base}` : "")}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </SlideMedia>
          <ChangeButton onClick={openFileInput}>영상 수정</ChangeButton>
        </>
      ) : (
        <AddMediaButton onClick={openFileInput}>+</AddMediaButton>
      )}
      <HiddenFileInput name="demo" ref={fileInputRef} type="file" accept="video/*" onChange={onFileChange} />
    </Wrapper>
  );
};

export default DemoVideoEditor;
