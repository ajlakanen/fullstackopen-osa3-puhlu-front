export const Filter = ({ value, onChange }) => {
  return (
    <p>
      Filter shown with <input value={value} onChange={onChange} />
    </p>
  );
};
