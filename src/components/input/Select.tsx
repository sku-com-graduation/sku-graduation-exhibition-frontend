import styled from "styled-components";

export const SelectCS = styled.select`
  box-sizing: border-box;

  font-size: 1rem;
  color: #333;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
  appearance: none;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #007bff;
  }

  option {
    font-size: 1rem;
    padding: 0.3125rem;
  }
`;
