
import 'bootstrap/dist/css/bootstrap.css'

export default function Access ({index, timestamp}) {
    return (
        <div className="col mb-3" key={index.toString()}>
            <div className="border card">
                <div className="card-body">
                <p className="mb-1">Access nr. {(index + 1).toString()}</p>
                    <p className="mb-0">Time: { new Intl.DateTimeFormat('en-GB', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(parseInt(timestamp.toString()) * 1000)}</p>
                </div>
            </div>
        </div>
      );
}