import React, { ChangeEvent, useRef, useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AddImageButton } from "./ui/Input";

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

const DeleteButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(255, 0, 0, 0.8);
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
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

  const [items, setItems] = useState<SlideItem[]>([]);

  useEffect(() => {
    setItems([
      ...existingImages.map((img, idx) => ({ id: `existing-${idx}`, type: "existing", img } as ExistingImage)),
      ...newImages.map((file, idx) => ({ id: `new-${idx}`, type: "new", file } as NewImage)),
    ]);
  }, [existingImages, newImages]);

  const handleNewImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setNewImages((prev) => [...prev, ...files]);
  };

  const deleteImage = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setExistingImages((prev) => prev.filter((_, idx) => `existing-${idx}` !== id));
    setNewImages((prev) => prev.filter((_, idx) => `new-${idx}` !== id));
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
                  <SlideImage
                    src={
                      item.type === "existing" ? `data:image/jpeg;base64,${item.img}` : URL.createObjectURL(item.file)
                    }
                    alt={item.id}
                  />
                  <DeleteButton onClick={() => deleteImage(item.id)}>X</DeleteButton>
                </ImageWrapper>
              </SortableItem>
            ))}
            <AddImageButton onClick={openFileInput}>+</AddImageButton>
          </SlideContainer>
        </SortableContext>
      </DndContext>

      <HiddenFileInput ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleNewImages} />
    </>
  );
};

export default SlideImageEditor;
