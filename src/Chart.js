/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { View, Dimensions, Alert } from 'react-native';
import { Svg, Rect, Text as SvgText } from 'react-native-svg';
import { LineChart } from 'react-native-chart-kit';

const kiteApiUrl = "https://kite.sunnysab.cn/api/v1";

// [1, 2, 3, 4, 5, 6, 7] -> [1, 4, 7]
const filterHours = hours => hours.filter(
  (_, index) => index % 3 === 0
);

const initHoursAxisXTitles = hours => filterHours(hours).map(
  // "1970-01-02T03:04:05.123456+08:00" -> "03:04"
  hour => hour.time.slice(11, 16)
)

const initDaysAxisXTitles = days => days.map(
  // "1970-01-02T03:04:05.123456+08:00" -> "01-02"
  day => day.date.slice(5, 10)
);

const initHoursValues = hours => filterHours(hours).map(
  hour => hour.consumption.toFixed(3)
);

const initDaysValues = days => days.map(
  day => day.consumption.toFixed(2)
);

// TODO: 检验响应，res.statuscode === 200 && json.code === 0
const fetchData = (url, auth, parser = data => data) => fetch(
  url, {
    headers: {
      contentType: 'multipart/form-data',
      Authorization: auth,
    },
  }
)
.then( res => res.json() )
.then( json => parser(json.data) )
.catch(
  error => {
    Alert.alert('错误', error.message);
    console.error(error);
  }
);

const parseRank = data => {
  const { consumption, rank, room_count: count } = data;
  const percent = (((count - rank) / count) * 100).toFixed(2);
  data.consumption = consumption.toFixed(2);
  data.rank = `${percent}%`;
  return data;
}

// bill
const fetchChartData = (roomId, mode, auth) => fetchData(
  `${kiteApiUrl}/pay/room/${roomId}/bill/${mode}`, auth
)

// rank
const fetchRank = (roomId, auth) => fetchData(
  `${kiteApiUrl}/pay/room/${roomId}/rank`, auth, parseRank
);

const Chart = props => {

  const chartConfig = {
    backgroundColor: 'white',
    backgroundGradientFrom: '#fbfbfb',
    backgroundGradientTo: '#fbfbfb',
    decimalPlaces: 2,
    color: 'rgba(24,144,255,1)', // (opacity = 1) => `rgba(24,144,255, ${opacity})`,
    labelColor: 'black', // (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      marginLeft: -40,
      borderRadius: 0,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#fff',
    },
  }

  const chartStyle = {
    marginVertical: 8,
    borderRadius: 6,
  };

  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
  });

  const renderTooltip = tooltipPos => (
    <View>
      <Svg>
        <Rect
          x={tooltipPos.x - 20}
          y={tooltipPos.y + 10}
          width="40"
          height="30"
          fill="#bae7ff"
        />
        <SvgText
          x={tooltipPos.x}
          y={tooltipPos.y + 30}
          fill="#112A46"
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle">
          {tooltipPos.value}
        </SvgText>
      </Svg>
    </View>
  );

  const onDataPointClick = data => (
    tooltipPos.x === data.x &&
    tooltipPos.y === data.y
    ? setTooltipPos(previousState => ({
      ...previousState,
      value: data.value,
      visible: !previousState.visible,
    }))
    : setTooltipPos({
      x: data.x,
      y: data.y,
      value: data.value,
      visible: true,
    })
  );

  return (
    <View style={{marginTop: 20}}>
      <LineChart

        data={{
          labels: props.data.axisXLabels,
          datasets: [{ data: props.data.values }],
        }}

        width={Dimensions.get('window').width + 40}
        height={250}
        // yAxisLabel="$"
        // yAxisSuffix="k"
        xAxisInterval={props.data.axisXLabels.length > 8 ? 3 : 1}
        yAxisInterval={1}
        chartConfig={chartConfig}
        segments={4} //不能去掉，避免当所有消费为 0 时程序崩溃
        bezier

        style={chartStyle}
        decorator={() => tooltipPos.visible && renderTooltip(tooltipPos)}
        onDataPointClick={onDataPointClick}

      />
    </View>
  );
};

export {
  Chart,
  initHoursAxisXTitles,
  initDaysAxisXTitles,
  initHoursValues,
  initDaysValues,
  fetchChartData,
  fetchRank,
};
