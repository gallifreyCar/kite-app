/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Alert, Button, Keyboard, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import {
  Chart,
  fetchChartData,
  fetchRank,
  initDaysAxisXTitles,
  initDaysValues,
  initHoursAxisXTitles,
  initHoursValues,
} from "./Chart";
import { fetchTextBlockData, TextBlock } from "./TextBlock";

const styles = StyleSheet.create({
  main: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 15,
    height: '100%',
    backgroundColor: 'hsla(210, 16.77%, 95.29%, 1.0)',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'hsla(0, 0%, 0%, 1.0)',
  },
  inputs_box: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
  },
  input: {
    height: 40,
    width: 120,
    borderColor: 'hsla(0, 0%, 0%, 0.6)',
    borderWidth: 1,
    color: '#000',
  },
  refer_buttons_box: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: 260,
  },
  rank_box: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 20,
  },
  rank_text: {
    color: '#000',
    fontSize: 25,
  },
  select_buttons_box: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'center',
    marginTop: 20,
    width: 180,
  },
});

let defaultInfo;

const setStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    alert(error);
  }
};

const getStorage = async key => {
  try {
    await AsyncStorage.getItem(key).then(res => {
      defaultInfo = res ? JSON.parse(res) : {};
    });
  } catch (error) {
    alert(error);
    return 'error';
  }
};

// const initPage = function () {
//   getStorage('electricityInfo').then(() => console.log(defaultInfo));
// };
// initPage();

const App = () => {
  const [isRefered, setIsRefered] = useState(false);
  const [building, setBuilding] = useState(defaultInfo?.building ?? '');
  const [room, setRoom] = useState(defaultInfo?.room ?? '');
  const [isChart, setIsChart] = useState(false);
  const [textBlockData, setTextBlockData] = useState({});
  const [chartData, setChartData] = useState({});
  const [rankData, setRankData] = useState({});
  const [isShowRank, setIsShowRank] = useState(false);
  const [isHoursData, setIsHoursData] = useState(false);
  const [charge, setCharge] = useState(0);

  useEffect(() => {
    getStorage('electricityInfo').then(() => {
      setBuilding(defaultInfo?.building ?? '');
      setRoom(defaultInfo?.room ?? '');
    });
  }, []);

  const checkRoomValid = function () {
    const buildingInt = parseInt(building);
    const roomInt = parseInt(room);
    if (
      buildingInt >= 1 &&
      buildingInt < 27 &&
      roomInt / 100 >= 0 &&
      roomInt / 100 < 17 &&
      roomInt > 100
    ) {
      const result = `10${buildingInt}${roomInt}`;
      return result;
    } else {
      Alert.alert('错误提示', '输入格式有误');
      return 'error';
    }
  };

  const fetchRest = function () {
    const checkRes = checkRoomValid();
    if (checkRes !== 'error') {
      setStorage('electricityInfo', JSON.stringify({building, room}));
      fetchTextBlockData(checkRes)
        .then(textBlockData => setTextBlockData(textBlockData))
        .then(() => {
          setIsChart(false);
          setIsRefered(true);
        });
    }
    Keyboard.dismiss();
  };
  const fetchDetail = function (mode) {
    const checkRes = checkRoomValid();
    if (checkRes !== 'error') {
      setStorage('electricityInfo', JSON.stringify({building, room}));
      fetchChartData(`10${building + room}`, mode)
        .then(data => {
          // set charge
          for (let value of data) {
            if (value.charge !== 0) setCharge(value.charge);
          }

          setChartData({
            values:
              mode === 'hours' ? initHoursValues(data) : initDaysValues(data),
            axisXLabels:
              mode === 'hours'
                ? initHoursAxisXTitles(data)
                : initDaysAxisXTitles(data),
          });
        })
        .then(() => setIsChart(true));
      fetchRank(`10${building + room}`, 'days')
        .then(data =>
          setRankData({
            consumption: data.consumption,
            rank: data.rank,
          }),
        )
        .then(() => setIsShowRank(true));
      setIsHoursData(mode === 'hours');
    }
    Keyboard.dismiss();
  };

  return (
    <View style={styles.main}>
      <Text style={styles.title}>电费余额查询</Text>
      <View style={styles.inputs_box}>
        <TextInput
          style={styles.input}
          placeholder="楼号"
          placeholderTextColor="#8c8c8c"
          keyboardType="number-pad"
          value={building}
          onChangeText={text => setBuilding(text)}
          defaultvalue={building}
        />
        <TextInput
          style={styles.input}
          placeholder="房间号"
          placeholderTextColor="#8c8c8c"
          keyboardType="number-pad"
          value={room}
          onChangeText={text => setRoom(text)}
          defaultvalue={room}
        />
      </View>
      <View style={styles.refer_buttons_box}>
        <Button title="查询余额" color="#2e62cd" onPress={fetchRest} />
        <Button
          title="查询使用情况"
          color="#f08c00"
          onPress={() => fetchDetail('hours')}
        />
      </View>
      {isChart ? (
        <View>
          {isShowRank ? (
            <View style={styles.rank_box}>
              <Text style={styles.rank_text}>
                {rankData.consumption}
                <Text
                  style={{
                    fontSize: 15,
                    color: 'hsla(210 ,7.08% ,55.69%,1.0)',
                  }}>
                  元
                </Text>
              </Text>
              <Text style={{color: '#bfbfbf'}}>
                24小时消费超越了 {rankData.rank} 的寝室
              </Text>
              <Text>上次充值：{charge}元（仅可查询七天内充值记录）</Text>
            </View>
          ) : (
            <></>
          )}
          <Chart data={chartData}></Chart>
          <View style={styles.select_buttons_box}>
            <Button
              title="过去一天"
              color={isHoursData ? '#ffa940' : '#8c8c8c'}
              onPress={() => fetchDetail('hours')}
            />
            <Button
              title="过去一周"
              color={isHoursData ? '#8c8c8c' : '#ffa940'}
              onPress={() => fetchDetail('days')}
            />
          </View>
        </View>
      ) : isRefered ? (
        <TextBlock data={textBlockData} />
      ) : (
        <></>
      )}
    </View>
  );
};
export default App;
