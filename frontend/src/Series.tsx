
import type { SeriesFromServer } from "./types";

type SeriesProps = {
  series: SeriesFromServer[],
  newSearchRefreshPage: () => void;
};


export default function Series({ series, newSearchRefreshPage }: SeriesProps) {
  return (
    <section className="app">
      
      <div className="seriesFlexBox">
        <label htmlFor="favoriteMovie">I recommend you these series...</label>
        <div className="textSeriesResponseAI">
            {series.map((item, index) => (
            <div className="seriesItem" key={`${item.title}-${index}`}>
              <h3 className="seriesTitle">
                {item.title} ({item.year})
              </h3>
              <p className="seriesRecommendation">{item.recommendation}</p>
            </div>
            ))}
        </div>
        
        <button type="button" onClick={newSearchRefreshPage}>
          New search
        </button>
      
      </div>
    </section>
  );
}
