import { useEffect } from "react";

export default function MiniLessonModal({ show, onClose, content }) {

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [show]);

  if (!show) return null;

  return (
    <>
      <div className="mini-overlay" onClick={onClose} />

      <div className="mini-modal">
        <div className="mini-header">
          <h3>Mini Lesson</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="mini-body">
          <div
            className="mini-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      <style>{`
        .mini-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 999;
        }

        .mini-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70%;
          max-width: 900px;
          background: #fff;
          border-radius: 10px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          max-height: 85vh; /* PENTING */
        }

        .mini-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #ddd;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
        }

        /* ================= KUNCI MASALAH ADA DI SINI ================= */
        .mini-body {
          padding: 20px;
          overflow-y: auto;        /* WAJIB */
          max-height: calc(85vh - 70px);
        }

        .mini-content {
          font-size: 15px;
          line-height: 1.7;
        }

        /* ====== FIX GAMBAR ====== */
        .mini-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 16px auto;
        }

        /* ====== FIX CODE BLOCK ====== */
        .mini-content pre {
          overflow-x: auto;
          background: #1e1e1e;
          color: #f8f8f2;
          padding: 14px;
          border-radius: 6px;
          margin: 16px 0;
        }

        .mini-content code {
          font-family: Consolas, monospace;
        }
      `}</style>
    </>
  );
}
