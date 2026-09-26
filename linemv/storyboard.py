#!/usr/bin/env python3
"""Storyboard for 《一直都在》 — the hand-drawn line-art MV.

Holds the scene table and emits timing.json / storyboard.json. Line times come
from ../mv/lyrics.lrc, which is forced-aligned to the vocal and carries a
stamp per character, so nothing here is spaced by guesswork.

One line runs through the whole film. Every scene either bends the previous
scene's line into its own subject or hands its line on to the next, so the
`transition` field of a scene always names what the line becomes.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
LRC = os.path.join(HERE, "..", "mv", "lyrics.lrc")

TITLE = "一直都在"
DEDICATION = "給　曉萱"
CLOSING = "有些故事不必說完，\n也會一直留在心上。"

SECTIONS = [
    ("intro", "Intro", 0.00, 14.24),
    ("verse1", "Verse 1", 14.24, 41.50),
    ("pre1", "Pre-Chorus 1", 41.50, 54.78),
    ("chorus1", "Chorus 1", 54.78, 86.06),
    ("verse2", "Verse 2", 86.06, 113.32),
    ("pre2", "Pre-Chorus 2", 113.32, 127.00),
    ("chorus2", "Chorus 2", 127.00, 157.94),
    ("bridge", "Bridge", 157.94, 188.52),
    ("final", "Final Chorus", 188.52, 222.84),
    ("outro", "Outro", 222.84, 253.25),
]

# palette keys resolved in palette.json at render time
DAY, SOFT, DUSK, NIGHT, WARM = "day", "soft", "dusk", "night", "warm"

# id, title, start, end, lines, visual, figures, background, camera,
# transition, mood, palette, photo slot, components
SCENES = [
    ("S01", "序幕：線的起點", 0.00, 14.24, [],
     "米白紙面全空。一條墨線從左緣長出，緩慢向右延伸、微微起伏。線上逐漸長出幾個並肩前行的小人物輪廓。片名「一直都在」與「給　曉萱」以手寫筆跡逐字浮現，停留後淡出。",
     "三到四個簡化人物沿線行走，步伐錯開，肩膀有輕微上下。",
     "紙張纖維質感極輕微浮動；線條邊緣有 1–2px 手繪抖動。",
     "極緩 push in，從全景推到線的高度。",
     "線繼續向右延伸，直接帶入下一景（不切）。",
     "安靜、期待、尚未有情緒重量。", DAY, None,
     ["paper", "guide_line", "walker", "title_text"]),

    ("S02", "一起往前跑", 14.24, 20.90, [1, 2],
     "線變成一條起伏的路：有階梯、坑洞、彎折。一群人沿路奔跑。其中一人在坑洞處踉蹌，旁邊的人回身拉住她，兩人笑著繼續。",
     "四人奔跑，手臂擺動；第三人絆一下、被第二人拉起；拉起後兩人並肩。",
     "路面線條隨鏡頭向左捲動；遠處幾筆山丘輪廓緩慢移動。",
     "側向 pan 跟隨人群。",
     "路的起伏拉平，向前延伸成逆向人潮的街道。",
     "青春、衝勁、笑著的狼狽。", DAY, None,
     ["road_path", "runner", "step_obstacle", "hill_outline"]),

    ("S03", "逆著人群", 20.90, 27.00, [3, 4],
     "街道上大量人形剪影朝同一方向流動。曉萱與朋友逆向而行。他們不沉重，邊走邊笑，其中一人回頭把落後的人拉上來。",
     "人潮以半透明淡線表示、等速平移；主要三人逆向、步伐輕快，有回頭與招手。",
     "背景街屋輪廓以視差較慢的速度反向移動。",
     "緩慢 pull out，讓人潮的量感顯現。",
     "街道的水平線向下收攏成兩條平行線 → 鐵軌。",
     "倔強、好玩、我們就是敢走自己的路。", DAY, None,
     ["crowd_silhouette", "street_facade", "walker", "road_path"]),

    ("S04", "一站一站", 27.00, 33.66, [5, 6],
     "兩條平行線成為鐵軌。一列手繪小火車自右駛入，車窗裡坐著幾個朋友。沿途站牌一個個後退掠過，牌面寫「第一站」「下一站」「再遠一點」。",
     "車窗內人物晃動、有人趴窗、有人回頭說話。",
     "鐵軌枕木等速後退；電線桿與雲以不同速度形成視差；車輪有輕微上下震動。",
     "側跟鏡頭，與火車同速，末段微微 pull out。",
     "最後一塊站牌的立柱向上抽長，成為下一景「看不到終點的路」的地平線。",
     "期待、遠方、我們真的到了。", DAY, "station_names",
     ["rail_track", "train", "train_window", "station_sign", "pole", "cloud"]),

    ("S05", "自己踏出的那一步", 33.66, 41.50, [7, 8],
     "前方是一段看不到終點的路，線在遠處淡去。曉萱停下。朋友一個個走到她身邊，沒有人推她，只是一起站著。停頓後她自己向前踏出一步，其他人跟上。",
     "曉萱靜止兩拍；朋友側向靠攏、肩膀微碰；曉萱抬腳跨出，其餘人依序起步。",
     "遠方線條的淡出邊界緩慢呼吸；地面有細小碎石點。",
     "緩慢 push in 到腳步，再輕輕 pull back。",
     "踏出的那一步激起的線條向上捲成風。",
     "不是無畏，是有人陪著才敢。", DAY, None,
     ["walker", "road_path", "horizon_fade", "footstep"]),

    ("S06", "逆風", 41.50, 44.28, [9],
     "風以長弧線橫掃畫面。人物逆風前進，衣角、頭髮、路旁草葉全部被吹向後方。沒有人停下。",
     "身體前傾、手護額；衣襬與髮絲高頻擺動。",
     "風線由右至左快速掠過，疏密不一；落葉幾片翻滾。",
     "輕微手持感的晃動（±3px），其餘固定。",
     "風線捲起地上一本相簿，吹開封面。",
     "吃力，但沒有退。", DAY, None,
     ["wind_stroke", "walker", "hair", "leaf"]),

    ("S07", "相簿被風吹開", 44.28, 47.98, [10],
     "一本手繪相簿在風中翻開。內頁浮出幾個空白照片框，框線逐一被畫出。框裡是笑著的人物輪廓。其中一張停留較久，輪廓稍微清晰一點。",
     "照片框內人物為靜態速寫，僅有極輕微的線條呼吸。",
     "書頁翻動，紙緣捲曲；風線減弱。",
     "緩慢 push in 到停留的那一張。",
     "該照片的邊框線開始滲出暖金色。",
     "想起來會笑，但喉頭會緊。", SOFT, "album_photos",
     ["album", "photo_frame", "page_curl", "walker"]),

    ("S08", "金色流出來", 47.98, 54.78, [11, 12],
     "暖金色沿著照片邊框流動、溢出框外，在紙面上畫出一條發亮的路徑，穿過先前出現過的路、鐵軌、風線的殘影，一路向前。",
     "無人物，或僅在金線經過處閃現半秒的人物剪影。",
     "金色沿線流動，亮度隨流動呼吸；紙面出現極淡的暖光暈。",
     "跟著金線移動的橫向 pan。",
     "金線抵達畫面中央，散開成曉萱站立的位置。",
     "溫柔地亮起來。", SOFT, None,
     ["gold_flow", "photo_frame", "afterimage"]),

    ("S09", "她只是走著", 54.78, 57.96, [13],
     "第一次把曉萱放在畫面中心。不是英雄站姿——她只是很普通地笑著走路。身邊慢慢浮現幾段回憶的淡線（跑步、火車、照片框）。",
     "自然行走，手臂自然擺動，偶爾側頭。",
     "周圍回憶淡線以極低透明度浮現又淡去。",
     "極緩 push in。",
     "她的腳步慢下來，最後停住坐下。",
     "有力量，但很日常。", SOFT, None,
     ["walker", "memory_ghost", "gold_flow"]),

    ("S10", "只是陪著", 57.96, 61.60, [14],
     "她曾停下、曾坐著、曾低著頭。一個朋友安靜地坐到旁邊。沒有台詞，沒有安慰的動作，只是陪著。兩人之間留一點距離，但肩膀朝向彼此。",
     "曉萱抱膝低頭；朋友走近、停頓、坐下；之後兩人幾乎不動，只有呼吸幅度。",
     "背景幾乎空白，僅地平線一筆；光線略暗。",
     "完全靜止的固定鏡頭（全片唯一一次）。",
     "地平線那一筆開始起伏，長成浪。",
     "最安靜的支撐。", SOFT, None,
     ["sitting_figure", "horizon_fade"]),

    ("S11", "穿過風浪，回頭伸手", 61.60, 68.73, [15, 16],
     "抽象的風與浪以粗細不一的長弧線翻捲。人物在浪線之間穿行。穿越後曉萱回頭，伸出手，把後面的朋友拉過來——這一拍是全片的種子。",
     "浪中身體傾斜；穿出後曉萱轉身、手臂前伸；朋友的手搭上、被拉出。",
     "浪線分層前後捲動；水花以短促點線表示。",
     "隨浪起伏的輕微上下運動，拉手時定住。",
     "兩人交握的手，線條延伸成一面高牆的邊。",
     "撐過去了，而且沒有丟下誰。", SOFT, None,
     ["wave_stroke", "walker", "reaching_hand"]),

    ("S12", "一起翻過那面牆", 68.73, 71.92, [17],
     "眼前一面很高的手繪牆。沒有人把牆撞破。有人蹲下當踏階、有人搭肩、有人在牆上回身拉人，最後所有人一起翻過去。",
     "四人依序：蹲、踩、上、回身拉；動作有重量感與停頓。",
     "牆面磚紋以稀疏短線表示；牆頭有草。",
     "緩慢向上 tilt，跟隨攀爬。",
     "翻過牆後落地，地面線條散成許多日常小物的輪廓。",
     "合作、笨拙、成功時的笑。", DAY, None,
     ["wall", "climbing_figure", "reaching_hand", "grass"]),

    ("S13", "把平凡活得不一樣", 71.92, 75.16, [18],
     "快速切換的日常小格：一起吃東西、拍照、坐車、走路、聊天、大笑、深夜不睡、舉起手機自拍。每格都是幾筆速寫，不超過 0.4 秒。",
     "每格一個明確動作，動作在該格內完成。",
     "格與格之間以手繪分隔線滑過，非硬切。",
     "每格輕微不同的取景，整體不動鏡。",
     "最後一格的桌面線條向下延伸成路面。",
     "最珍貴的其實是普通的日子。", DAY, "daily_moments",
     ["vignette_frame", "food", "phone", "bus_seat", "chat_figures"]),

    ("S14", "腳印連成的路", 75.16, 86.06, [19, 20, 21],
     "路面上慢慢浮現腳印——不只曉萱的，很多人的腳印交錯重疊。鏡頭持續拉遠，最後發現這些腳印本身組成了一條很長很長的路，一路通向畫面深處。",
     "無行走人物，只有腳印依序浮現（與拍點同步）。",
     "腳印以墨點暈開的方式出現；遠景逐漸出現先前的山、軌道、牆的淡影。",
     "全片最大幅的 pull out，等速、不停。",
     "拉遠到極遠後，路的線條收成桌上一張紙條的邊。",
     "累積起來的重量，安靜但確實。", SOFT, None,
     ["footstep", "road_path", "hill_outline", "afterimage"]),

    ("S15", "任性的願望", 86.06, 89.00, [22],
     "桌面。幾隻手在小紙條上寫字。紙條上是簡單的塗鴉願望：海浪、飛機、山、碗、相機——不寫具體事件。",
     "手部特寫，筆尖移動；寫完把紙條推到桌子中間。",
     "桌面木紋幾筆；紙條邊緣輕微翹起。",
     "俯視固定，末段極緩 push in。",
     "一張紙條被拿起，鏡頭跟著它被貼上牆。",
     "胡鬧、真心、有點不好意思。", DAY, None,
     ["desk", "wish_note", "hand_writing", "doodle_icon"]),

    ("S16", "貼到牆上", 89.00, 92.54, [23],
     "大家看著紙條一起笑。有人踮腳把紙條貼到牆上，紙條愈貼愈多，形成一面願望牆。",
     "笑的動作以肩膀抖動與頭部後仰表示，不畫誇張表情；踮腳、伸手貼紙。",
     "紙條被貼上時有輕微晃動後靜止；牆面淡淡的紋理。",
     "緩慢 pull out 顯示整面牆。",
     "牆上的紙條開始一張一張翻面。",
     "笑鬧裡的認真。", DAY, None,
     ["wish_wall", "wish_note", "walker", "hand_writing"]),

    ("S17", "願望真的變成了篇章", 92.54, 99.58, [24, 25],
     "牆上的願望紙一張張翻面，變成車票、照片、地圖、寫著日期的小卡、回憶卡。代表那些說著玩的事，真的做到了。",
     "無主要人物，物件本身是主角。",
     "每張紙翻面時有紙的厚度與陰影；翻完後整面牆輕輕呼吸。",
     "橫向 pan 掃過整面牆，速度隨歌詞句尾放慢。",
     "其中一張車票被抽走，畫面跟著它甩向下一景。",
     "驚訝、驕傲、我們真的做到了。", DAY, "wish_wall_photos",
     ["wish_wall", "ticket", "map", "photo_frame", "memory_card"]),

    ("S18", "瘋狂得不像話", 99.58, 102.54, [26],
     "全片最活潑的一段。奔跑、大笑、亂跳、自拍、追逐、把人抬起來。動畫節奏明顯加快，線條也更放。",
     "動作幅度最大；允許誇張的肢體弧線與殘影。",
     "背景僅幾筆速度線；紙面輕微搖晃。",
     "快速的小幅 whip pan（但不炫技，仍是手繪感）。",
     "最後一跳的高點定格半拍，畫面亮度降下來。",
     "笑到不行的那種日子。", DAY, None,
     ["runner", "jumping_figure", "speed_line", "phone"]),

    ("S19", "沉默很長的夜", 102.54, 113.32, [27, 28, 29],
     "深夜。幾個朋友坐在便利商店外的台階、車內或窗邊。沒有人說話。只有路燈、風、遠處經過的車燈。安靜但不孤單——他們坐得很近。",
     "幾乎靜止；偶爾有人換姿勢、有人低頭看手機再放下。",
     "路燈有極慢的明滅；遠處車燈由左至右掠過並在地面留下光帶；風吹動招牌。",
     "極緩的 push in，最後停在兩個人的側影。",
     "路燈的光暈擴散，覆蓋畫面，轉入下一段的晨光。",
     "沉默也是一種陪伴。", DUSK, None,
     ["street_lamp", "storefront", "sitting_figure", "car_light", "window"]),

    ("S20", "時間帶走一些模樣", 113.32, 116.34, [30],
     "人物沿線持續行走。外貌不明顯變老，改變的是衣服、髮型與背景的年份感：招牌樣式、路樹高度、天空顏色逐段變化。",
     "同一組人物連續行走，每 0.8 秒換一次服裝與髮型的線稿版本。",
     "背景以橫向捲動的方式換代；路樹由小長到大。",
     "等速側向 pan，不停。",
     "行走中有人回頭。",
     "時間過去了，但腳步沒斷。", SOFT, None,
     ["walker", "street_facade", "tree", "sky_tone"]),

    ("S21", "熟悉的目光", 116.34, 120.18, [31],
     "幾個人先後回頭。臉部只有最少的幾筆，但姿態與眼神方向讓人認得出——還是以前那個笑容。",
     "回頭的動作分三次發生，時間錯開；回頭後定住約一拍。",
     "背景速度放慢至近乎停止。",
     "緩慢 push in 到最後一個回頭的人。",
     "回頭的視線方向拉出一條線，成為回憶冊的書脊。",
     "認得出來的那種熟悉。", SOFT, None,
     ["walker", "face_minimal"]),

    ("S22", "回憶冊闔上", 120.18, 127.00, [32, 33],
     "一本回憶冊攤開在紙面上，內頁閃過前面出現過的畫面速寫。冊子慢慢闔起，封面上手寫兩個字：「我們」。",
     "無人物，僅翻頁的手（只畫手）。",
     "頁面翻動、紙緣捲曲、闔上時有輕微氣流吹動旁邊的紙屑。",
     "俯視，緩慢 pull out。",
     "封面「我們」兩字的最後一筆延伸出去，成為下一景伸出的手臂。",
     "收藏起來的重量。", SOFT, None,
     ["album", "page_curl", "hand_writing", "title_text"]),

    ("S23", "她拉起過我們", 127.00, 133.62, [34, 35],
     "回到那個拉手的動作，但這次看得更清楚：曉萱伸手，把一個坐在地上的人拉起來。動作平實，不戲劇化。",
     "蹲下、伸手、握住、施力、把人帶起；被拉的人站穩後拍了拍衣服。",
     "背景僅地平線與幾筆草；暖金色從交握處微微透出。",
     "中景固定，拉起時輕微 push in。",
     "被拉起的那個人，轉身向另一個方向伸出手。",
     "她做過的事。", WARM, None,
     ["reaching_hand", "sitting_figure", "walker", "gold_flow"]),

    ("S24", "傳下去", 133.62, 140.73, [36, 37],
     "剛剛被拉起的人，現在伸手拉起另一個人。同樣的動作，不同的人。畫面開始出現第三組、第四組。",
     "三組拉手動作依序發生，節奏與拍點對齊；每組完成後保持牽著。",
     "暖金色沿著每一次交握點亮起，連成一條線。",
     "緩慢橫向 pan，跟隨傳遞的方向。",
     "所有交握的手連成一條不斷的線。",
     "溫柔沒有停在她身上。", WARM, None,
     ["reaching_hand", "walker", "gold_flow"]),

    ("S25", "手連成的線", 140.73, 147.14, [38, 39],
     "牽起的手形成一條橫貫畫面的線。這條線同時也是先前那面牆的頂端、那條路的邊、那道浪的稜——它們本來就是同一條線。",
     "人物成為線上的節點，輕微上下呼吸。",
     "線的其他段落浮現牆、路、浪的淡影，證明是同一筆。",
     "持續 pull out，人物逐漸變小。",
     "線向下鋪平，成為地面。",
     "原來一直是同一條。", WARM, None,
     ["chain_of_hands", "wall", "road_path", "wave_stroke"]),

    ("S26", "足夠有重量", 147.14, 157.94, [40, 41, 42],
     "地面上腳印再次浮現，但這次密度更高、方向更多。鏡頭拉到最遠，整條路在紙面上顯現為一道長長的、有厚度的墨痕。",
     "無人物。",
     "腳印與拍點同步浮現；紙面出現極淡的暖金底色。",
     "極緩 pull out 至最遠，末段停住。",
     "墨痕的顏色開始退去，紙面轉向深藍。",
     "不必證明什麼了。", WARM, None,
     ["footstep", "road_path", "paper"]),

    ("S27", "夜裡的肩膀", 157.94, 164.62, [43, 44],
     "背景轉為深藍夜色，線條改為米金色。兩個朋友坐在堤防上（或屋頂、海邊）。不說話。肩膀靠得很近。遠處有一點城市的光。",
     "兩人幾乎靜止，只有呼吸與偶爾的側頭；其中一人把頭輕輕靠過去。",
     "海面（或遠景）有極緩的波動；星點極輕微閃動。",
     "極緩 push in，幅度比前面都小。",
     "堤防的水平線向遠方延伸。",
     "不用說完的話。", NIGHT, None,
     ["embankment", "sitting_figure", "star", "city_glow", "wave_stroke"]),

    ("S28", "不必再趕", 164.62, 171.00, [45, 46],
     "所有人物第一次停止奔跑。大家只是慢慢走。步伐明顯放慢，畫面的所有動態都跟著慢下來。",
     "行走速度降為前面的一半；手臂擺幅變小；有人停下看天空。",
     "夜色中的風線變得很長很慢。",
     "鏡頭運動明顯放慢，接近靜止。",
     "前方的地平線隆起。",
     "允許自己慢下來。", NIGHT, None,
     ["walker", "wind_stroke", "star"]),

    ("S29", "那些翻過的山", 171.00, 174.50, [47],
     "前方的線隆起成連綿的山。山的稜線就是先前那條路的延續，可以看出是同一筆畫過來的。",
     "山腳下有幾個極小的人物剪影在走。",
     "山的輪廓線由左至右被「畫」出來；雲影掠過山面。",
     "緩慢橫向 pan 掃過山脈。",
     "山的稜線落下，成為城市天際線。",
     "回望來時路。", NIGHT, None,
     ["mountain", "walker", "cloud"]),

    ("S30", "笑到流淚的夜晚", 174.50, 178.10, [48],
     "山變成夜晚的城市天際線，一格一格的窗戶依序亮起。其中一扇窗裡，幾個人笑成一團。",
     "窗內人物剪影互相推擠、後仰大笑。",
     "窗戶以不規則順序亮起；遠處有車燈流動。",
     "push in 到那扇亮著的窗。",
     "窗框放大，成為一張照片的邊框。",
     "最好笑的那個晚上。", NIGHT, "window_photo",
     ["city_skyline", "window", "sitting_figure", "car_light"]),

    ("S31", "路是回憶組成的", 178.10, 183.98, [49, 50, 51],
     "鏡頭開始大幅拉遠。我們以為一直在看一條路，拉遠後才發現：這條路是由無數張小小的回憶卡、照片框、紙條、車票拼成的。",
     "無人物。",
     "組成路面的每個小元件都有極輕微的獨立呼吸，整體像會動的鑲嵌。",
     "全片第二大的 pull out，等速。",
     "所有元件開始向畫面中央聚攏。",
     "原來重要的從來不是終點。", NIGHT, None,
     ["memory_card", "photo_frame", "ticket", "road_path"]),

    ("S32", "彼此陪伴", 183.98, 188.52, [52],
     "聚攏的元件散開，化成人物。所有曾出現過的人，一個一個站定，形成一大群人並肩站著的畫面。",
     "人物依序落定，每個人落定時有一個小小的站穩動作。",
     "背景由深藍開始回暖，邊緣先亮。",
     "定鏡，僅極輕微呼吸。",
     "人群中央讓出視線，曉萱的剪影走進來。",
     "我們都在這裡。", NIGHT, None,
     ["walker", "memory_card", "afterimage"]),

    ("S33", "不同時期的她", 188.52, 191.68, [53],
     "不同時期的曉萱剪影，一個一個從畫面兩側走進來，走到中央時彼此疊合，最後成為我們記憶中的那一個她。",
     "每個剪影走路的姿態略有不同；疊合時線條合併而非淡出。",
     "背景由深藍過渡到暖色，過程橫跨整個 S33–S35。",
     "緩慢 push in。",
     "疊合完成的她站定，腳邊的障礙物線條開始被擦掉。",
     "她一直都是這樣的人。", WARM, None,
     ["walker", "afterimage", "gold_flow"]),

    ("S34", "障礙被擦掉", 191.68, 195.12, [54],
     "先前出現過的牆、風、雨、坑洞，一樣一樣被橡皮擦式地擦去（線條反向消退），最後畫面上只剩下她走過的那條路。",
     "她站著不動，看著這些東西消失。",
     "擦除以 stroke-dashoffset 反向動畫實現，殘留一點紙面擦痕。",
     "定鏡。",
     "剩下的那條路兩側，開始長出其他人的腳印。",
     "不需要誰來衡量。", WARM, None,
     ["wall", "wind_stroke", "road_path", "eraser_mark"]),

    ("S35", "也成為我們", 195.12, 202.52, [55, 56],
     "朋友們一個一個出現在路上，與她並排。這一次主角不只是她——她也成為了現在的我們的一部分。",
     "人物依序淡入並開始同步行走；隊伍逐漸變寬。",
     "暖金色從腳下的路面向上滲；背景完全回到暖色。",
     "緩慢 pull out 讓整排人入鏡。",
     "隊伍上方浮現一排空白的回憶卡。",
     "她在我們身上。", WARM, None,
     ["walker", "road_path", "gold_flow"]),

    ("S36", "回憶卡", 202.52, 205.66, [57],
     "前面所有畫面以「一張一張手繪回憶卡」的方式快速回顧——不是影片剪輯，而是卡片翻飛。每張卡上是該場景的速寫。",
     "無人物（人物在卡片內）。",
     "卡片以不同角度翻入畫面，帶輕微旋轉與紙張陰影。",
     "鏡頭輕微後退，讓卡片有空間飛入。",
     "卡片開始減速並尋找自己的位置。",
     "全部都還在。", WARM, "memory_cards",
     ["memory_card", "photo_frame"]),

    ("S37", "排成四個字", 205.66, 212.18, [58, 59],
     "回憶卡慢慢排列、對齊，最後由卡片本身拼出巨大的四個字：「一直都在」。字是由回憶組成的，不是寫出來的。",
     "無人物。",
     "卡片逐一歸位，歸位時有輕微的吸附感；完成後整體輕輕呼吸。",
     "緩慢 pull out 讓四個字完整入鏡。",
     "字形的卡片一張張淡去，只剩下幾個坐著的人。",
     "這就是答案。", WARM, None,
     ["memory_card", "title_text"]),

    ("S38", "就這樣坐著", 212.18, 217.57, [60],
     "其他文字全部消失。只剩下幾個朋友自然地坐在一起——不刻意留空位，就是一群人坐著。",
     "坐姿自然、彼此距離不等；有人說話、有人聽、有人發呆。",
     "背景幾乎空白，只有一筆地平線與暖光。",
     "定鏡。",
     "地面的暖光開始向外擴散。",
     "不必回答，不必逞強。", WARM, None,
     ["sitting_figure", "horizon_fade"]),

    ("S39", "我們就在你的身旁", 217.57, 223.09, [61],
     "鏡頭慢慢向後拉。暖金色的燈光一盞一盞亮起，把這群人圍在中間。",
     "坐著的人幾乎不動，只有呼吸與偶爾的側頭。",
     "燈一盞一盞亮，順序不規則；光暈相互重疊。",
     "持續 pull out，速度極慢且不停。",
     "最外圈的燈光淡去，畫面回到紙面。",
     "謝謝妳真的來過。", WARM, None,
     ["sitting_figure", "lamp_glow"]),

    ("S40", "最後一頁", 223.09, 231.54, [62, 63],
     "回到最開始那本回憶冊。書頁一頁一頁翻過去，翻到最後一頁。上面不寫「完」，也不寫「The End」。只有一句手寫的：「一直都在。」",
     "只出現翻頁的手。",
     "翻頁速度由快漸慢；最後一頁停住時紙面輕輕起伏。",
     "俯視，緩慢 push in 到那一行字。",
     "那行字的最後一筆向右拉長。",
     "安靜地收下。", WARM, None,
     ["album", "page_curl", "hand_writing", "title_text"]),

    ("S41", "線又出現了", 231.54, 236.72, [64],
     "最開始那條手繪線再次出現在空白的紙面上，從左緣緩慢向右延伸。跟序幕同一條線，同樣的筆觸。",
     "線上慢慢長出幾個小小的人物，繼續走。",
     "紙面回到最初的米白；線的抖動與序幕一致。",
     "極緩 push in，與序幕鏡位對稱。",
     "人物的線稿逐漸簡化。",
     "沒有要趕去哪裡。", WARM, None,
     ["paper", "guide_line", "walker"]),

    ("S42", "線繼續延伸", 236.72, 243.60, [65, 66],
     "人物慢慢簡化成最單純的線稿。線繼續向右延伸，穿出畫面邊緣。人物沒有消失、沒有變成光點、沒有走向天空——他們只是繼續走。",
     "人物以極簡筆畫行走，步伐穩定不停。",
     "線的末端持續超出畫面右緣；紙面靜止。",
     "極緩 pull out，直到線細如一筆。",
     "畫面保留線的痕跡，淡入最後字卡。",
     "故事沒有真正結束。", WARM, None,
     ["guide_line", "walker", "paper"]),

    ("S43", "最後字卡", 243.60, 250.60, [],
     "米白背景。中央手寫：「一直都在」。下一行：「給　曉萱」。再下一行小字：「有些故事不必說完，也會一直留在心上。」畫面右緣仍留著那條線的末端。",
     "無人物。",
     "字以手寫筆順逐字浮現；紙面極輕微呼吸。",
     "完全靜止。",
     "音樂結束後才開始淡黑。",
     "想念，但平靜。", WARM, None,
     ["paper", "title_text", "guide_line"]),

    ("S44", "留白", 250.60, 253.25, [],
     "字卡持續停留。音樂完全結束後，畫面在最後 2 秒內緩慢淡入黑。",
     "無。", "無，完全靜止。", "靜止。", "淡黑作結。",
     "留白。", WARM, None, ["paper", "title_text"]),
]

FIELDS = ("visual", "figures", "background", "camera", "transition",
          "mood", "palette", "photo", "components")

PHOTO_SLOTS = {
    "station_names": ("S04 火車站牌", "站牌牌面可換成真實地名或真實回憶的地點，"
                      "目前是「第一站／下一站／再遠一點」。", 3),
    "album_photos": ("S07 相簿內頁", "3–4 個照片框，可直接放入真實合照；"
                     "停留較久的那一張建議放最有代表性的一張。", 4),
    "daily_moments": ("S13 日常小格", "8 格速寫中可換 2–3 格為真實生活照。", 3),
    "wish_wall_photos": ("S17 願望牆", "翻面後的車票／照片／地圖，"
                         "可換成真實票根與照片的掃描。", 5),
    "window_photo": ("S30 亮著的那扇窗", "窗內畫面可換成一張真實的夜晚合照。", 1),
    "memory_cards": ("S36 回憶卡快速回顧", "卡片中可混入 4–6 張真實照片，"
                     "與手繪卡交錯。", 6),
}

STAMP = re.compile(r"\[(\d+):(\d+(?:\.\d+)?)\]")
WORD = re.compile(r"<(\d+):(\d+(?:\.\d+)?)>")


def load_lines(path):
    marks = []
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            if line.lstrip().startswith("#"):
                continue
            stamps = list(STAMP.finditer(line))
            if not stamps:
                continue
            body = line[stamps[-1].end():].strip()
            for m in stamps:
                marks.append((int(m.group(1)) * 60 + float(m.group(2)), body))
    marks.sort(key=lambda m: m[0])

    out = []
    for i, (t, body) in enumerate(marks):
        if not body:
            continue
        end = marks[i + 1][0] if i + 1 < len(marks) else t + 4.0
        chars, plain, pos = [], [], 0
        for m in WORD.finditer(body):
            plain.append(body[pos:m.start()])
            pos = m.end()
            chars.append({"t": round(int(m.group(1)) * 60 + float(m.group(2)), 2),
                          "i": sum(len(p) for p in plain)})
        plain.append(body[pos:])
        text = "".join(plain)
        for c in chars:
            c["c"] = text[c["i"]] if c["i"] < len(text) else ""
        out.append({"start": round(t, 2), "end": round(end, 2),
                    "lyric": text, "chars": chars})
    return out


def section_of(t):
    for key, _, a, b in SECTIONS:
        if a <= t < b:
            return key
    return SECTIONS[-1][0]


def main():
    lines = load_lines(LRC)
    scene_of = {}
    for sid, _, a, b, nums, *_ in SCENES:
        for n in nums:
            scene_of[n] = sid

    timing = {
        "title": TITLE,
        "dedication": DEDICATION,
        "audio": {"file": "給蹦仔_320k.mp3", "duration": 253.25,
                  "bpm": 140.0, "beat_one": 0.139},
        "video": {"width": 1920, "height": 1080, "fps": 30,
                  "codec": "h264", "container": "mp4"},
        "sections": [{"id": k, "name": n, "start": a, "end": b,
                      "duration": round(b - a, 2)} for k, n, a, b in SECTIONS],
        "lines": [dict(index=i + 1, section=section_of(ln["start"]),
                       scene=scene_of.get(i + 1), **ln)
                  for i, ln in enumerate(lines)],
    }

    board = {
        "title": TITLE,
        "dedication": DEDICATION,
        "closing": CLOSING,
        "principle": "一條線貫穿全片，每一景由上一景的線變形而來，最後線延伸出畫面不消失。",
        "scenes": [],
        "photo_slots": [{"key": k, "where": v[0], "note": v[1], "count": v[2]}
                        for k, v in PHOTO_SLOTS.items()],
    }
    for sid, name, a, b, nums, *rest in SCENES:
        scene = {"id": sid, "name": name, "start": a, "end": b,
                 "duration": round(b - a, 2),
                 "section": section_of(a), "lines": nums,
                 "lyrics": [lines[n - 1]["lyric"] for n in nums]}
        scene.update(dict(zip(FIELDS, rest)))
        board["scenes"].append(scene)

    parts = sorted({c for s in board["scenes"] for c in s["components"]})
    board["components"] = parts

    for name, data in (("timing.json", timing), ("storyboard.json", board)):
        with open(os.path.join(HERE, name), "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
        print(f"wrote {name}")

    covered = sorted(n for s in SCENES for n in s[4])
    missing = [i for i in range(1, len(lines) + 1) if i not in covered]
    print(f"{len(SCENES)} scenes, {len(lines)} lyric lines, "
          f"{len(parts)} components, {len(PHOTO_SLOTS)} photo slots")
    if missing:
        print(f"WARNING lines with no scene: {missing}", file=sys.stderr)
    gaps = [(SCENES[i][3], SCENES[i + 1][2]) for i in range(len(SCENES) - 1)
            if abs(SCENES[i][3] - SCENES[i + 1][2]) > 0.001]
    if gaps:
        print(f"WARNING scene timeline not contiguous: {gaps}", file=sys.stderr)
    print(f"timeline {SCENES[0][2]:.2f} -> {SCENES[-1][3]:.2f}s")


if __name__ == "__main__":
    main()
