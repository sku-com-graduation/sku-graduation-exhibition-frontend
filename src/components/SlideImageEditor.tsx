import React, { ChangeEvent, useRef, useState } from "react";
import styled from "styled-components";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AddArea } from "./ui/Input";
import { v4 as uuidv4 } from "uuid";
import { CloseIcon } from "./Icons";
import { DeleteButton } from "./ui/Button";

const SlideContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SlideImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.5rem;
`;

const ImageWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

interface SlideImageEditorProps {
  existingImages: string[];
  newImages: File[];
  setExistingImages: React.Dispatch<React.SetStateAction<string[]>>;
  setNewImages: React.Dispatch<React.SetStateAction<File[]>>;
}

interface ExistingImage {
  id: string;
  type: "existing";
  img: string;
}

interface NewImage {
  id: string;
  type: "new";
  file: File;
}

type SlideItem = ExistingImage | NewImage;

const SortableItem = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const SlideImageEditor = ({ existingImages, newImages, setExistingImages, setNewImages }: SlideImageEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  // 초기 items는 부모 상태를 기반으로 한 번만 생성합니다.
  const [items, setItems] = useState<SlideItem[]>(() => [
    ...existingImages.map((img) => ({ id: `existing-${uuidv4()}`, type: "existing", img } as ExistingImage)),
    ...newImages.map((file) => ({ id: `new-${uuidv4()}`, type: "new", file } as NewImage)),
  ]);

  const handleNewImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    // 새 파일에 고유 id를 부여
    const newItems = files.map((file) => ({ id: `new-${uuidv4()}`, type: "new", file } as NewImage));

    // items와 부모 상태 모두 업데이트
    setItems((prev) => [...prev, ...newItems]);
    setNewImages((prev) => [...prev, ...files]);
  };

  const deleteImage = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);

    setExistingImages(newItems.filter((i): i is ExistingImage => i.type === "existing").map((i) => i.img));
    setNewImages(newItems.filter((i): i is NewImage => i.type === "new").map((i) => i.file));
  };

  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    const sortedItems = arrayMove(items, oldIndex, newIndex);
    setItems(sortedItems);

    setExistingImages(sortedItems.filter((i): i is ExistingImage => i.type === "existing").map((i) => i.img));
    setNewImages(sortedItems.filter((i): i is NewImage => i.type === "new").map((i) => i.file));
  };

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
          <SlideContainer>
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id}>
                <ImageWrapper>
                  <SlideImage src={item.type === "existing" ? `data:image/jpeg;base64,${item.img}` : URL.createObjectURL(item.file)} alt={item.id} />
                  <DeleteButton
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteImage(item.id);
                    }}
                  >
                    <CloseIcon />
                  </DeleteButton>
                </ImageWrapper>
              </SortableItem>
            ))}
            <AddArea onClick={openFileInput}>+</AddArea>
          </SlideContainer>
        </SortableContext>
      </DndContext>

      <HiddenFileInput ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleNewImages} />
    </>
  );
};

export default SlideImageEditor;
