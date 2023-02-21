import './Loader.css';

export default function Loader({ isShow }: { isShow: boolean }) {
  return (
    <>
      {isShow &&
        <div className="spinner-container">
          <div className="loading-spinner"></div>
        </div>}
    </>
  );
}
