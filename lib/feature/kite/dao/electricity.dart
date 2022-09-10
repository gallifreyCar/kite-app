/*
 * 上应小风筝  便利校园，一步到位
 * Copyright (C) 2022 上海应用技术大学 上应小风筝团队
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import '../entity/electricity.dart';

// 本地存储
abstract class ElectricityStorageDao {
  String? get lastBuilding;

  set lastBuilding(String? building);

  String? get lastRoom;

  set lastRoom(String? room);
}

// 远程
abstract class ElectricityServiceDao {
  // 获取电费数据
  Future<Balance> getBalance(String room);

  // 获取排名数据
  Future<Rank> getRank(String room);

  // 获取按小时用电记录
  Future<List<HourlyBill>> getHourlyBill(String room);

  // 获取按天用电记录
  Future<List<DailyBill>> getDailyBill(String room);
}
