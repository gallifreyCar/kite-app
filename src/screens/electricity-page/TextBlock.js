import React from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';

const styles = StyleSheet.create({
  main: {
    width: '100%',
    marginVertical: 20,
    padding: 20,
    backgroundColor: 'hsla(0, 0%, 98%, 0.9)',
  },
  text: {
    fontSize: 15,
    color: 'hsla(0, 0%, 0%, 1.0)',
  },
});

const fetchTextBlockData = async function (roomId) {
  // 注意这个方法前面有async关键字
  try {
    // 注意这里的await语句，其所在的函数必须有async关键字声明
    const response = await fetch(
      `https://kite.sunnysab.cn/api/v1/pay/room/${roomId}`,
      {
        method: 'GET',
        headers: {
          contentType: 'multipart/form-data',
          Authorization:
            'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOjUzMCwiaXNfYWRtaW4iOmZhbHNlfQ.tKe4F_5Mw4APij5fehYLGFYQl8ICmquf-vzbYvI3lf0',
        },
      },
    );

    const responseJson = await response.json();
    if (responseJson.code === 200) {
      throw new Error(responseJson.msg);
    } else {
      const data = responseJson.data;

      data.power = data.power.toFixed(2);
      data.ts = data.ts.substring(0, 16);
      data.ts = data.ts.replace('T', ' ');

      return data;
    }
  } catch (error) {
    Alert.alert('错误', error.message);
    console.error(error);
  }
};

const showTips = function () {
  Alert.alert(
    '数据错误提示',
    '此数据来源于学校在线电费查询平台。如有错误，请以充值机显示金额为准。',
  );
};

const TextBlock = props => {
  console.log(props);
  return props.data === undefined ? (
    <></>
  ) : (
    <View style={styles.main}>
      <Text style={{alignSelf: 'flex-end'}} onPress={showTips}>
        数据不一致？
      </Text>
      <Text style={styles.text}>房间号：{props.data.room}</Text>
      <Text style={styles.text}>剩余金额：{props.data.balance}</Text>
      <Text style={styles.text}>剩余电量：{props.data.power}</Text>
      <Text style={{fontSize: 17, marginTop: 10, color: '#bfbfbf'}}>
        更新时间：{props.data.ts}
      </Text>
    </View>
  );
};

export {TextBlock, fetchTextBlockData};
