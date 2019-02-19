document.addEventListener('DOMContentLoaded', function () {
  const client = new KeenAnalysis({
    projectId: '5c6471eec9e77c000121bb53',
    readKey: 'EA80E1D1209DDCCF3D7B01FA7D8461950D57B4207DCA0470DFE1770A81A5CCA42CF7CD4EBEFF904F76F55DCA0CCA23D0D9B68B87EED8601744FEBC9BB883AB46C674D8FD81603CAB827004BC78734189096152E6D9BA5D6A27418684562F9A0D'
  });
  const params = (new URL(document.location)).searchParams;
  const timeframe = {
    start: params.get('start') || '2018-08-20T12:00:00.000Z',
    end: params.get('end') || '2019-03-01T12:00:00.000Z'
  };
  const interval = params.get('interval') || 'weekly';

  document.getElementById('start').value = timeframe.start;
  document.getElementById('end').value = timeframe.end;
  document.getElementById('interval').value = interval;

  const locate = async metric => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${metric.location}&key=AIzaSyB7DfwQwnhYjPzx8UIF0JHlgVeNwSDnZkY`;
    const { viewport } = (await (await fetch(url)).json()).results[0].geometry;
    const filters = [
      ...(metric.filters || []),
      {
        property_name: 'lat',
        operator: 'gt',
        property_value: viewport.southwest.lat
      },
      {
        property_name: 'lat',
        operator: 'lt',
        property_value: viewport.northeast.lat
      },
      {
        property_name: 'lng',
        operator: 'lt',
        property_value: viewport.southwest.lng
      },
      {
        property_name: 'lng',
        operator: 'gt',
        property_value: viewport.northeast.lng
      }
    ];
    return {
      ...metric.query,
      filters
    };
  };
  const query = async metric => metric.query;
  const preprocessors = { locate, query };

  const total = async results => {
    const priors = await client.query({
      ...results.query,
      timeframe: {
        start: '2018-01-01T12:00:00.000Z',
        end: results.query.timeframe.start
      },
      interval: 'yearly'
    });
    let sum = priors.result.reduce((total, point) => total += point.value, 0);
    const totals = results.result.map(point => {
      sum += point.value;
      return { ...point, value: sum };
    });
    return {
      ...results,
      query: { ...results.query, analysis_type: 'total' },
      result: totals
    };
  };
  const identity = a => a;
  const postprocessors = { total, identity };

  fetch('dashboard.json')
    .then(res => res.json())
    .then(dashboards => Object.keys(dashboards).forEach(key => {
      const { title, metrics } = dashboards[key];
      const chart = new KeenDataviz({
        container: `#${key}`,
        title,
        showLoadingSpinner: true,
        labels: metrics.map(({ label }) => label)
      });
      client.run(metrics.map(async metric => {
        const preprocess = preprocessors[metric.preprocess || 'query'];
        const postprocess = postprocessors[metric.postprocess || 'identity'];
        const query = await preprocess(metric);
        console.log(metric, query);
        const results = await client.query({ ...query, timeframe, interval });
        return postprocess(results);
      }))
      .then(results => chart.render(results))
      .catch(error => chart.message(error.message));
    }));  
});