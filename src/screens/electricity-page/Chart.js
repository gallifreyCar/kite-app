/* eslint-disable no-unused-vars */
import React, {useState} from 'react';
import {Alert, Dimensions, View} from 'react-native';
import {Rect, Svg, Text as TextSVG} from 'react-native-svg';
import {LineChart} from 'react-native-chart-kit';

const initHoursAxisXTitles = function (hoursData) {
  let titles = hoursData.filter((item, index) => index % 3 === 0);
  titles = titles.map(item => item.time.substring(11));
  // console.log(titles);
  return titles;
};
const initDaysAxisXTitles = function (daysData) {
  const titles = daysData.map(item => item.date.substring(5));
  return titles;
};

const initHoursValues = function (hoursData) {
  let values = hoursData.filter((item, index) => index % 3 === 0);
  values = values.map(item => item.consumption.toFixed(3));
  // console.log(values);
  return values;
};
const initDaysValues = function (daysData) {
  const values = daysData.map(item => item.consumption.toFixed(2));
  return values;
};

const fetchChartData = async function (roomId, mode, auth) {
  // 注意这个方法前面有async关键字
  try {
    // 注意这里的await语句，其所在的函数必须有async关键字声明
    const response = await fetch(
      `https://kite.sunnysab.cn/api/v1/pay/room/${roomId}/bill/${mode}`,
      {
        method: 'GET',
        headers: {
          contentType: 'multipart/form-data',
          Authorization:
          auth,
        },
      },
    );
    const responseJson = await response.json();
    console.log(responseJson.data);
    return responseJson.data;
  } catch (error) {
    Alert.alert('错误', error.message);
    console.error(error);
  }
};

const fetchRank = async function (roomId ,auth) {
  // 注意这个方法前面有async关键字
  try {
    // 注意这里的await语句，其所在的函数必须有async关键字声明
    const response = await fetch(
      `https://kite.sunnysab.cn/api/v1/pay/room/${roomId}/rank`,
      {
        method: 'GET',
        headers: {
          contentType: 'multipart/form-data',
          Authorization:
          auth,
        },
      },
    );
    const responseJson = await response.json();
    responseJson.data.consumption = responseJson.data.consumption.toFixed(2);
    responseJson.data['rank'] = `${(
      ((responseJson.data.room_count - responseJson.data.rank) /
        responseJson.data.room_count) *
      100
    ).toFixed(2)}%`;

    return responseJson.data;
  } catch (error) {
    Alert.alert('错误', error.message);
    console.error(error);
  }
};

const Chart = props => {
  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    visible: false,
    value: 0,
  });

  return (
    <View style={{marginTop: 20}}>
      <LineChart
        data={{
          labels: props.data.axisXLabels,
          datasets: [
            {
              data: props.data.values,
            },
          ],
        }}
        width={Dimensions.get('window').width + 40}
        height={250}
        // yAxisLabel="$"
        // yAxisSuffix="k"
        xAxisInterval={props.data.axisXLabels.length > 8 ? 3 : 1}
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: 'white',
          backgroundGradientFrom: '#fbfbfb',
          backgroundGradientTo: '#fbfbfb',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(24,144,255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            marginLeft: -40,
            borderRadius: 0,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#fff',
          },
        }}
        segments={4} //不能去掉，避免当所有消费为0时程序崩溃
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 6,
        }}
        decorator={() => {
          return tooltipPos.visible ? (
            <View>
              <Svg>
                <Rect
                  x={tooltipPos.x - 20}
                  y={tooltipPos.y + 10}
                  width="40"
                  height="30"
                  fill="#bae7ff"
                />
                <TextSVG
                  x={tooltipPos.x}
                  y={tooltipPos.y + 30}
                  fill="#112A46"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle">
                  {tooltipPos.value}
                </TextSVG>
              </Svg>
            </View>
          ) : null;
        }}
        onDataPointClick={data => {
          let isSamePoint = tooltipPos.x === data.x && tooltipPos.y === data.y;

          isSamePoint
            ? setTooltipPos(previousState => {
                return {
                  ...previousState,
                  value: data.value,
                  visible: !previousState.visible,
                };
              })
            : setTooltipPos({
                x: data.x,
                value: data.value,
                y: data.y,
                visible: true,
              });
        }}
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
