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

import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:kite/feature/freshman/page/component/card.dart';
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../../entity.dart';
import 'common.dart';
import 'profile.dart';

class MateListWidget extends StatelessWidget {
  final bool showDormitory;
  final List<Mate> mateList;
  final VoidCallback? callBack;
  final RefreshController _refreshController = RefreshController();

  MateListWidget(this.mateList, {this.callBack, this.showDormitory = true, Key? key}) : super(key: key);

  /// 打开个人详情页
  void loadMoreInfo(BuildContext context, Mate mate) {
    final lastSeenText = calcLastSeen(mate.lastSeen);
    Navigator.of(context).push(MaterialPageRoute(builder: (ctx) {
      return BasicInfoPageWidget(
        name: mate.name,
        college: mate.college,
        infoItems: [
          InfoItem(Icons.emoji_objects, '专业', mate.major),
          InfoItem(Icons.bed, '寝室', '${mate.building} ${mate.room}室${mate.bed}床'),
          InfoItem(mate.gender == 'M' ? Icons.male : Icons.female, '性别', mate.gender == 'M' ? '男' : '女'),
          if (mate.province != null) InfoItem(Icons.location_city, '省份', mate.province!),
          if (mate.lastSeen != null) InfoItem(Icons.location_city, '上次登录时间', lastSeenText),
          ...buildContactInfoItems(context, mate.contact), // unpack
        ],
      );
    }));
  }

  ///构建基本信息
  Widget buildBasicInfoWidget(BuildContext context, Mate mate) {
    final wechat = mate.contact?.wechat;
    final qq = mate.contact?.qq;
    final tel = mate.contact?.tel;
    final wechatRow = buildInfoItemRow(
      iconData: Icons.wechat,
      text: '微信:  ${wechat != null && wechat != '' ? wechat : '未填写'}',
      context: context,
    );
    final qqRow = buildInfoItemRow(
      iconData: Icons.person,
      text: 'QQ:  ${qq != null && qq != '' ? qq : '未填写'}',
      context: context,
    );
    final telRow = buildInfoItemRow(
      iconData: Icons.phone,
      text: '手机:  ${tel != null && tel != '' ? tel : '未填写'}',
      context: context,
    );

    return Stack(children: [
      Align(
        alignment: const Alignment(1.3, -1.4),
        child: SizedBox(
          width: 100,
          height: 100,
          child: buildSexIcon(mate.gender == 'M'),
        ),
      ),
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            mate.name,
            style: const TextStyle(
                fontSize: 30, color: Colors.black54, fontWeight: FontWeight.bold, overflow: TextOverflow.ellipsis),
          ),
          SizedBox(
            height: 4.h,
          ),
          buildInfoItemRow(
            iconData: Icons.school,
            text: '学院:  ${mate.college}',
            context: context,
          ),
          buildInfoItemRow(
            iconData: Icons.emoji_objects,
            text: '专业:  ${mate.major}',
            context: context,
          ),
          if (showDormitory)
            buildInfoItemRow(
              iconData: Icons.home,
              text: '寝室:  ${mate.building}${mate.room}室',
              context: context,
            ),
          wechatRow,
          qqRow,
          telRow,
        ],
      ),
    ]);
  }

  /// 性别icon印章
  Widget buildSexIcon(bool isMale) {
    return Icon(
      isMale ? Icons.male : Icons.female,
      size: 50,
      color: isMale ? Colors.lightBlue : Colors.pinkAccent,
    );
  }

  Widget buildListView(BuildContext context, List<Mate> list) {
    return ListView(
      controller: ScrollController(),
      children: list.map((e) {
        return PersonItemWidget(
          basicInfoWidget: buildBasicInfoWidget(context, e),
          name: e.name,
          isMale: e.gender == 'M',
          lastSeenText: calcLastSeen(e.lastSeen),
          locationText: e.province,
          onLoadMore: () => loadMoreInfo(context, e),
          height: 235,
        );
      }).toList(),
    );
  }

  Widget buildBody(BuildContext context, List<Mate> mateList) {
    return Column(
      children: [
        buildInfoItemRow(
          iconData: Icons.info,
          text: '总计人数(不包含自己): ${mateList.length}',
          context: context,
        ).withTitleBarStyle(context),
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            child: SmartRefresher(
              controller: _refreshController,
              onRefresh: callBack,
              child: buildListView(context, mateList),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return buildBody(context, mateList);
  }
}
