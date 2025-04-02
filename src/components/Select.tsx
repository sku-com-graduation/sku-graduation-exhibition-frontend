import styled from "styled-components";

export const SelectCS = styled.select`
  appearance: none;
  padding: 0.5rem 2rem 0.5rem 2rem;
  border-radius: 2rem;
  border: 1px solid #ccc;
  background-color: #ffffff;
  font-size: 1rem;
  color: #333;
  text-align: center;
  cursor: pointer;
  background: none;
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 1rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #888;
  }

  &:focus {
    outline: none;
    border-color: #0077fe;
    box-shadow: 0 0 0 2px rgba(0, 119, 254, 0.2);
  }

  @media (max-width: 768px) {
    font-size: 100%;
    padding: 0.5rem 1rem;
  }
`;
