import "../styles/FileList.css";

export default function FileList({ files }) {
  if (!files || files.length === 0)
    return <p className="no-files">No files uploaded yet.</p>;

  return (
    <ul className="file-list">
      {files.map((f) => (
        <li key={f.id} className="file-item">
          <div className="file-info">
            <span className="file-name">{f.filename}</span>
            <span className="file-expiry">(Expires: {f.expiry || "1d"})</span>
          </div>
          <a
            href={f.downloadURL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-download"
          >
            Download
          </a>
        </li>
      ))}
    </ul>
  );
}
