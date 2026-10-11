# Kế hoạch REFORMING VIETNAM’S POLITICAL SYSTEM

Ngày lập: 11/10/2026. Trạng thái: kế hoạch trước triển khai; chưa xây hoặc xuất bản website. Chỉ bắt đầu tạo HTML khi người dùng nhắn “bắt đầu xây dựng file html”.

## 1. Mục tiêu và các quyết định đã chốt

**Môn học: Lịch sử Đảng Cộng sản Việt Nam.** Đề bài gốc: “Using specific practical examples, clarify the necessity of reforming the political system. Relate this to the process of building and developing the political system in Vietnam today. Discuss the responsibilities of your group.”

Bài trình bày phải trả lời đủ ba yêu cầu: dùng ví dụ thực tiễn làm rõ sự cần thiết; liên hệ quá trình xây dựng, phát triển hệ thống chính trị Việt Nam hiện nay; nêu trách nhiệm cụ thể của nhóm. Giáo trình và văn kiện Đảng là căn cứ lịch sử, đường lối; văn bản nhà nước làm rõ thể chế hóa; nguồn khảo sát/phân tích bổ sung cho đánh giá triển khai.

- Tạo trải nghiệm trình chiếu điện ảnh có người thuyết trình điều khiển, giải thích sự cần thiết của cải cách hệ thống chính trị, ví dụ Việt Nam hiện nay và trách nhiệm của nhóm.
- Tên duy nhất: **REFORMING VIETNAM’S POLITICAL SYSTEM**, dùng trên bìa và trong thông tin tài liệu. Không dùng tên phụ hoặc tagline tên dự án.
- Đúng **15 cảnh/slide**, tổ chức thành **8 chương kể chuyện**; mỗi cảnh có các nhịp tương tác bên trong. Đã bỏ cảnh nguồn riêng và cảnh hai câu hỏi thảo luận mở theo yêu cầu mới; không ép tám chương thành tám màn hình tĩnh.
- Bàn giao `D:/Downloads/CPV/reforming_vietnam_political_system_3d.html`, mở trực tiếp bằng `file://`, không cần Internet, npm, máy chủ hoặc file tài nguyên bên cạnh. Theo lựa chọn của người dùng, không tạo hay xuất bản Sites.
- Nội dung chính và kịch bản nói bằng tiếng Anh; giao diện chỉnh sửa bằng tiếng Việt. Có lớp chú giải tiếng Việt tùy chọn, mặc định tắt, giữ tiêu đề tiếng Anh.
- Người nghe cần nắm được vấn đề, thay đổi và thông điệp qua hình ảnh dù không theo kịp tiếng Anh. Không đánh đổi nội dung học thuật để lấy hiệu ứng.
- Mặc định phần nói chính khoảng 11 phút trong khoảng 10–12 phút của prompt. Bốn câu hỏi trắc nghiệm tương tác là thời gian bổ sung; không có cảnh thảo luận mở riêng. Đây là thời lượng thiết kế, chưa phải giới hạn đã được giảng viên xác nhận; cho phép chỉnh sửa.
- Nhãn chủ đề người dùng xác nhận: **Topic 6**; không suy ra số nhóm từ số chủ đề. Danh sách được cung cấp: **Phạm Tiến Mạnh; Nguyễn Tuấn Hưng; Peeters Hải Nam; Nguyễn Quang Huy**. Chưa xác nhận cả bốn người đều trực tiếp thuyết trình. Phân công người nói, công việc và đóng góp thực tế để trống đến khi nhóm điền.

## 2. Căn cứ đã kiểm tra và giới hạn

### Tài liệu hiện có

- Đã trích xuất các tin nhắn hiển thị từ [Recovery Target](https://chatgpt.com/share/6acb836b-4d14-83ec-b6ec-ec649a5f39ba). Các yêu cầu bổ sung là mê cung thủ tục, âm thanh theo trạng thái, trải nghiệm 3D liên tục, ghi chú riêng và hỗ trợ rubric. Bản trích xuất nằm trong thư mục phân tích; không coi các tuyên bố đã thực hiện trong chat cũ là bằng chứng về sản phẩm hiện có.
- PowerPoint gốc có 12 slide, không có speaker notes hoặc thời lượng từng slide. Slide nguồn cuối chỉ chứa credit hình ảnh, không phải thư mục chính trị [1]–[5].
- HTML hiện có chỉ chứa slide 1–10, không có JavaScript, không có slide active và hai ảnh bản đồ chưa có `src`. Các chức năng trình chiếu, quiz, editor và xuất file chưa hoạt động. Xây lại bộ máy trình chiếu và mô hình dữ liệu; giữ những thành phần thị giác và nội dung phù hợp. Chỉ thay thế file hiện có khi bản mới qua kiểm tra.
- Đã đọc mã của ba reference HTML. `index.html` cung cấp bố cục biên tập và SVG; reference USA cung cấp camera và phân lớp bản đồ; reference Việt Nam cung cấp bố cục riêng theo cảnh, sân khấu 16:9 và tài nguyên nhúng. Không mang theo CDN, nội dung Mỹ hoặc các lớp CSS vá chồng chéo. Riêng cảnh 63 → 34 được phép dùng hình dáng Việt Nam và các khối cách điệu theo yêu cầu mới; không trình bày mô hình đó như bản đồ ranh giới chính thức.
- Trang Monogrid phụ thuộc JavaScript; chưa kiểm tra được tương tác thực tế bằng trình duyệt. Dùng định hướng nghệ thuật đã thống nhất, không tuyên bố đã quan sát đầy đủ hiệu ứng hay sao chép tác phẩm/code của họ.
- Giáo trình lịch sử là bản quét 221 trang PDF, phần lớn mỗi trang PDF chứa hai trang sách. Đã kiểm tra bìa, mục lục; đọc trực quan các trang sách liên quan gồm 260–265 (Đại hội VI), 276–283 (trong đó 281–282 về Trung ương 3 khóa VII), 346–353 (Cương lĩnh 2011 và triển khai), 398–407 (thành tựu, hạn chế và bài học). Trang sách 404–407 có mục “Một số bài học kinh nghiệm”. Không tuyên bố đã đọc toàn bộ 221 trang. Số trang dẫn dưới đây là số in trong sách, không phải số trang PDF.

### Rubric

File rubric ghi tên môn Ho Chi Minh’s Ideology, khác môn Lịch sử Đảng trong yêu cầu. Áp dụng các tiêu chí người dùng cung cấp, đồng thời ghi rõ sai khác trong hướng dẫn bàn giao. Các số 01/03 là phân bổ điểm trên tổng 10 điểm; không tự gọi chúng là phần trăm chính thức dù tiêu đề cột ghi “Weight (%)”.

| Tiêu chí gốc | Điểm | Cảnh/bằng chứng | Phần nhóm phải thực hiện |
| --- | ---: | --- | --- |
| Time | 1 | Phân bổ thời gian, ghi chú và điều khiển theo nhịp | Tập dượt; xác nhận giới hạn giờ thực tế |
| content | 3 | Cảnh 2–7, 9–10; khái niệm, lịch sử, dẫn chứng và phân tích; nguồn trong ghi chú | Hiểu và bảo vệ lập luận |
| Presentation skills | 1 | Chữ dễ đọc, kịch bản tiếng Anh, câu chuyển ý, ghi chú riêng | Thuyết trình trực tiếp, không đọc nguyên văn màn hình |
| Product | 1 | Đủ 15 cảnh; offline; editor và export hoạt động | Kiểm tra trên máy trình chiếu |
| Creativity | 1 | Mê cung, camera, bản đồ, âm thanh, hình ảnh xuyên suốt | Kích hoạt hiệu ứng đúng luận điểm |
| Comments and evaluation | 1 | Gói câu hỏi và hướng dẫn nhận xét | Nhận xét nhóm khác có căn cứ |
| Asking questions relevant to the content and making connections with practical situations | 1 | Cảnh 11–14; quiz, câu hỏi miệng tùy chọn trong notes và liên hệ thực tế | Đặt và trả lời câu hỏi |
| Active participation in class | 1 | Phân công tham gia, hoạt động thảo luận | Các thành viên chủ động tham gia |

Website hỗ trợ các tiêu chí; không bảo đảm điểm tối đa hoặc thay thế phần tham gia của sinh viên.

## 3. Cấu trúc nội dung và storyboard

Giữ nội dung master prompt với các điều chỉnh mới của người dùng: bỏ toàn bộ cảnh hai câu hỏi thảo luận mở (gồm phần chọn ba tiêu chí), bỏ cảnh nguồn riêng và bỏ quốc kỳ ở cảnh cuối. Đánh số lại thành 15 cảnh. Nguồn vẫn lưu trong dữ liệu và ghi chú riêng. Mỗi trạng thái đầu có một tiêu đề ngắn, một hình ảnh chủ đạo và 2–4 từ khóa; phần giải thích đầy đủ vẫn được giữ trong dữ liệu.

| Chương kể chuyện | Cảnh | Nội dung và trải nghiệm chốt |
| --- | --- | --- |
| 1. Câu hỏi trung tâm | 1–2 | Bìa toàn màn hình; mạng lưới vàng hội tụ vào câu hỏi. Cảnh 2 giữ PART 01, bổ sung nhịp định nghĩa hệ thống chính trị và sơ đồ thành phần dựa trên nguồn. |
| 2. Mê cung thủ tục | 3 | Giữ ba lực thúc đẩy cải cách: kinh tế, hiệu quả hành chính, hội nhập. Nhân vật người dân 3D tối giản nhìn từ phía sau bước vào các sợi dây đỏ có độ dày và chiều sâu; Apply Reform chuyển màu tuần tự sang xanh và tái sắp xếp dây trong không gian, làm rõ luồng và trách nhiệm. Đây là mô hình minh họa, không phải dữ liệu trước–sau đo được. |
| 3. Nền tảng lịch sử | 4 | Giữ PART 02 và giới thiệu ba ví dụ. Nhịp timeline Đổi Mới 1986 → Nghị quyết 18 năm 2017 → thay đổi năm 2025, gắn với nguồn; giải thích cải cách hệ thống chính trị rộng hơn sắp xếp hành chính. |
| 4. Tái cấu trúc 63 → 34 | 5 | Mô hình 3D cách điệu lấy ảnh trong CPV làm tham khảo là trọng tâm; 63 khối → chuyển động sáp nhập → 34 khối → sơ đồ chính quyền hai cấp. Kết thúc bằng điều kiện triển khai và tiêu chí đánh giá, không chỉ con số. |
| 5. Trách nhiệm và liêm chính | 6 | Giữ NO EXCEPTIONS như nguyên tắc chính sách, kèm nhãn “Policy principle”, và Enforce / Prevent / Disclose; không mô tả đây là kết quả thực tế đã đạt. Ngọn lửa SVG có lớp sáng và chuyển động được kiểm soát. Liên kết với chuỗi chính sách → tổ chức → trách nhiệm → thực hiện → đánh giá ở nhịp kết của cảnh 5 và phần giải thích. |
| 6. Trải nghiệm người dân | 7 | Giữ Access online / Reuse data / Track progress / Leave a trail. Nhân vật 3D từ cảnh 3 tiếp tục hành trình nộp–xử lý–theo dõi–nhận kết quả, camera đi theo; các tuyến cyan sáng lần lượt và bàn hỗ trợ trực tiếp nằm trong cùng luồng. Giữ ví dụ kế hoạch Hà Nội và hỗ trợ trực tiếp cho người cần. |
| 7. Trách nhiệm và tầm nhìn | 8–10 | PART 03; ba cam kết học sâu, tham gia, liêm chính. Cảnh 9 có lớp phân công nhóm thực tế để sửa. Cảnh 10 phân biệt giai đoạn triển khai 2025–26 với mục tiêu 2030 và 2045; không thể hiện mục tiêu như thành tích đã đạt. |
| 8. Quiz và kết | 11–15 | Cảnh 11–14 là bốn quiz; không có cảnh hai câu hỏi thảo luận mở. Cảnh 15 chỉ có “Thank you for listening”, chữ đẹp trên nền điện ảnh với ánh sáng vàng tinh tế; không quốc kỳ, không thêm nội dung. |

### Ba lớp lập luận theo trọng tâm môn học

1. **Bối cảnh lịch sử:** Đổi Mới 1986, quá trình đổi mới phương thức lãnh đạo và hệ thống chính trị, yêu cầu tổ chức bộ máy trong Nghị quyết 18 năm 2017. Mỗi mốc có bối cảnh và ý nghĩa, không chỉ có tên/ngày tháng.
2. **Quá trình cải cách hiện nay:** ví dụ chính quyền địa phương năm 2025 thể hiện chủ trương Đảng → thể chế hóa của Quốc hội → Chính phủ và chính quyền địa phương tổ chức thực hiện. Đây là một ví dụ trong phạm vi rộng hơn của đổi mới hệ thống chính trị; không đồng nhất các mốc hoặc suy quan hệ nhân quả đơn giản.
3. **Ý nghĩa thực tiễn và trách nhiệm:** đánh giá qua trách nhiệm rõ, năng lực thực hiện, khả năng tiếp cận và trải nghiệm người dân; liên hệ việc nhóm học, kiểm chứng nguồn, phối hợp và trình bày có căn cứ.

### Mạch kể chuyện thống nhất và phân tích theo cảnh

Một tác phẩm có 15 cảnh: giữ cùng mạng lưới điểm sáng, vật liệu, hướng chuyển động và hành trình của người dân. Mỗi cảnh tiếp tục câu hỏi của cảnh trước. Các PART là nhịp thở ngắn trong cùng không gian, không mở một bộ thiết kế mới. Đổi cường độ chuyển động để phục vụ lập luận; sau cao trào, giữ trạng thái ổn định để khán giả hiểu.

- **Câu hỏi mở đầu:** “How can reform make Vietnam’s political system work better for its people?”
- **Cảnh 2 — vai trò các thành phần:** dùng cách diễn đạt giáo trình trang 347: “Đảng lãnh đạo hệ thống chính trị, đồng thời là bộ phận của hệ thống ấy.” Sơ đồ thể hiện Đảng Cộng sản Việt Nam, Nhà nước, Mặt trận Tổ quốc Việt Nam và các tổ chức chính trị–xã hội; nhãn quan hệ phải làm rõ vai trò lãnh đạo của Đảng, chức năng quản lý của Nhà nước, quyền làm chủ của nhân dân. Nhân dân là trung tâm/chủ thể của câu chuyện, không vẽ thành một cơ quan ngang hàng. Không đặt Đảng ngoài hệ thống hoặc dùng các nút bằng nhau làm mờ vai trò khác nhau. Căn cứ trang 346–348 và Cương lĩnh 2011, phần IV. Notes tiếng Anh: “The Party leads the political system and is also part of it. The State manages public affairs under the law. The people exercise their right to mastery.” Đây là diễn giải phục vụ thuyết trình; sơ đồ thành phần không thay thế toàn bộ mô tả thể chế hiện hành.
- **Cảnh 2–3 — Vì sao cần cải cách:** kinh tế và xã hội thay đổi, người dân cần dịch vụ dễ tiếp cận, hội nhập cần phối hợp và năng lực thực thi. Chuyển câu hỏi từ “có bao nhiêu cơ quan?” sang “ai chịu trách nhiệm và người dân được phục vụ thế nào?”.
- **Cảnh 3 — trọng tâm 2 phút 20 giây:** 25 giây bước vào và đặt tình huống; 30 giây mất phương hướng và nhận diện chồng chéo; 25 giây nói và điều khiển nhịp Apply Reform (chuyển động chỉ chiếm một phần thời gian); 40 giây giải thích ba động lực khi hình ảnh đã ổn định; 20 giây phân tích vì sao sắp xếp luồng mới chỉ là bước đầu. Giữ nhãn minh họa, không khẳng định đây là hồ sơ hay quy trình thực tế.
- **Cảnh 4 — ba mốc, ba vai trò:** 1986 mở bối cảnh Đổi Mới toàn diện và yêu cầu thích ứng; 2017 tập trung nhiệm vụ đổi mới tổ chức bộ máy qua Nghị quyết 18; 2025 đưa ra ví dụ tái cấu trúc chính quyền địa phương cụ thể với Nghị quyết 60-NQ/TW của Trung ương Đảng làm điểm xuất phát về chủ trương, trước các văn bản Quốc hội và vận hành mới. Notes có hai mốc cầu nối 1992 và 2011, mô tả ở phần căn cứ lịch sử bên dưới. Không gọi đây là ba sự kiện cùng loại hoặc quan hệ nhân quả duy nhất. Mỗi nhịp có hình riêng trong cùng mạng lưới: không gian mở → các lớp trách nhiệm được sắp xếp → mô hình địa phương. Mốc năm chỉ là điểm neo, không phải hàng chữ timeline.
- **Cảnh 5 — ba lớp:** ở nhịp giải thích, đường sáng nối ba nhãn ngắn “Party direction → Legal framework → Implementation”; notes chỉ rõ Nghị quyết 60 (12/4/2025) → Nghị quyết 202 (12/6/2025) và Luật 72 (16/6/2025) → bộ máy mới hoạt động 1/7/2025. Đặt vai trò, ngày và nguồn trong nhịp phụ thay vì dồn vào cao trào 3D. What changed? 63 → 34 và chính quyền hai cấp. Why does it matter? Mục tiêu giảm đầu mối, rõ trách nhiệm và phối hợp tốt hơn. What determines success? Năng lực thực hiện, chất lượng triển khai, trách nhiệm giải trình và trải nghiệm người dân. Dành phần nói và nhịp dừng sau 3D cho lớp thứ ba; cho đường kết nối đi tiếp vào cảnh 6 và 7.
- **Cảnh 6 — nguyên tắc và thực thi:** “NO EXCEPTIONS” thể hiện nguyên tắc chính sách về xử lý vi phạm, không khẳng định mọi trường hợp thực tế đều đã được xử lý nhất quán. Màn hình kèm nhãn “Policy principle”. Căn cứ trước hết là phần phương hướng phòng, chống tham nhũng, lãng phí, tiêu cực trong Báo cáo chính trị Đại hội XIV (đoạn về kết hợp phòng ngừa với phát hiện, xử lý, không có ngoại lệ); sau đó mới lấy Nghị định 130/2020/NĐ-CP làm ví dụ cơ chế kiểm soát tài sản, thu nhập. Enforce / Prevent / Disclose là ba nhãn diễn giải của bài, không gọi là ba trụ cột trích nguyên văn từ văn kiện. Câu nói gợi ý: “The Party’s policy calls for prevention and strict handling of violations, with no exceptions. How consistently this is applied must be assessed through evidence.” Phân biệt nguyên tắc, biện pháp Enforce / Prevent / Disclose và kết quả thực thi; không dùng hiệu ứng lửa như bằng chứng thành công.
- **Cảnh 7 — người dân tiếp tục hành trình:** dùng lại cùng mô hình 3D của cảnh 3: hình dáng, tỷ lệ, vật liệu trung tính và phong cách cách điệu nhất quán; không thay bằng điểm sáng hoặc nhân vật khác. Không gian navy tối và cyan, nhân vật vẫn tách rõ khỏi đường dẫn. Camera đi theo qua bốn bước nộp → xử lý → theo dõi → nhận kết quả, dừng ở từng bước theo điều khiển của người trình bày. Các tuyến cyan lần lượt sáng, làm rõ nơi tiếp nhận, trạng thái hồ sơ, điểm hỗ trợ trực tiếp và điểm kết thúc. Bàn hỗ trợ nằm cạnh và kết nối với luồng số, không ở ngoài hành trình hoặc trở thành nhánh bị bỏ lại. Tình huống là người dân chưa thành thạo công nghệ: biết nộp ở đâu, biết hồ sơ đang ở bước nào, nhận hỗ trợ để hoàn thành và nhận kết quả. Không gán thời gian xử lý, biểu mẫu hay quy trình pháp lý cụ thể chưa kiểm chứng. Kế hoạch Hà Nội là ví dụ triển khai phổ cập kỹ năng, không phải bằng chứng đã cải thiện kết quả. Cyan biểu thị kênh số; xanh lá cảnh 3 biểu thị luồng được sắp xếp rõ hơn, không dùng thay thế nhau. Nhân vật tạo tính liên tục xuyên cảnh, môi trường thay đổi để thể hiện bối cảnh mới.
- **Cảnh 9 — trách nhiệm cụ thể:** Academic responsibility: hiểu nội dung, kiểm tra nguồn, giải thích lập luận. Team responsibility: phân công, hoàn thành công việc, hỗ trợ nhau. Presentation responsibility: nói từ hiểu biết, trả lời có căn cứ, phân biệt điều đã xác minh và điều chưa biết. Gắn Learn deeply / Participate / Act with integrity với các hành động này. Bảng tên dùng danh sách người dùng đã gửi; công việc và bằng chứng hoàn thành để trống cho nhóm điền; không tự tuyên bố nhóm đã hoàn thành việc chưa được xác nhận.
- **Cảnh 10 — ba mốc có trạng thái và cách thể hiện khác nhau:** tại ngày lập kế hoạch 11/10/2026, giai đoạn 2025–26 đã bắt đầu và một phần đã qua; không thể hiện cả ba mốc như tương lai đồng nhất. **2025–26:** lớp không gian gần thể hiện tổ chức lại và triển khai, gắn từng claim với trạng thái “Verified change” hoặc “Implementation underway” nếu nguồn hỗ trợ; kế hoạch mang trạng thái “Policy plan”, không tự coi đã hoàn tất hoặc có hiệu quả. **2030:** không gian mở rộng, mục tiêu phát triển trung hạn có nhãn “Goal”. **2045:** camera nhìn xa hơn, tầm nhìn dài hạn có nhãn “Long-term goal” cho mục tiêu được dẫn nguồn. Cùng đường sáng từ cảnh 7 nối các lớp, nhưng khác bố cục, khoảng cách và trạng thái. Mục tiêu tương lai không trở thành thành tựu đã đạt hoặc dự báo chắc chắn. Câu chuyển sang quiz: “Now, let us test what makes reform work.”
- **Cảnh 15 — lời chốt 20–30 giây trong notes:** “We began by asking why reform is necessary. From Đổi Mới to today, the Party’s reform policies respond to changing needs. The lesson is to put people first and turn policy into effective action. Structure, responsibility, and accessible services must work together. Our group must understand the sources and explain the evidence honestly. Thank you for listening.” Màn chiếu vẫn chỉ có lời cảm ơn, không thêm câu chốt hoặc quốc kỳ.

### Thời gian nói và phối hợp nhóm

| Cảnh | Thời gian nói dự kiến |
| --- | ---: |
| 1 | 25 giây |
| 2 | 40 giây |
| 3 | 140 giây |
| 4 | 50 giây |
| 5 | 110 giây |
| 6 | 55 giây |
| 7 | 90 giây |
| 8 | 15 giây |
| 9 | 45 giây |
| 10 | 65 giây |
| 15, lời chốt sau quiz | 25 giây |

Tổng phần nói chính 660 giây = 11 phút; bốn quiz và tương tác là thời gian bổ sung. Timer phần nói có Pause/Resume để dừng khi tương tác, không tính quiz vào 11 phút. Bắt đầu timer bằng thao tác chủ động. Đây là dự toán, sẽ chỉnh sau tập dượt.

Kịch bản tiếng Anh dùng câu ngắn, một ý mỗi câu, từ quen thuộc; notes chia thành từ khóa, câu nói gợi ý và câu chuyển chương. Phân người nói theo chương khi nhóm điền tên; tập kỹ điểm bàn giao và các câu hỏi khó: giảm đầu mối có đồng nghĩa hiệu quả không, số hóa có bỏ lại người dân không, và đâu là kết quả đã được chứng minh. Nếu chưa có bằng chứng, nói rõ giới hạn thay vì đoán.

Thêm câu hỏi miệng tùy chọn trong notes sau quiz 2: “What would you check to know whether services have improved?” Cho một người trả lời ngắn rồi liên hệ tới khả năng tiếp cận, trách nhiệm và trải nghiệm. Không thêm cảnh, không khôi phục hai câu hỏi thảo luận đã bỏ, không tự nhận việc này bảo đảm điểm rubric.

### Nhịp cao trào

- **Mê cung dây 3D — cảnh 3:**
  - **Nhân vật:** mô hình người tối giản, hơi cách điệu; đầu, vai, lưng rõ, không cần chi tiết khuôn mặt. Đứng tiền cảnh, nhìn từ phía sau và hơi lệch một bên. Nhân vật phụ trợ trải nghiệm, không cạnh tranh thị giác với dây.
  - **Camera:** góc ba phần tư từ phía sau, hơi cao hơn vai; tạo cảm giác khán giả đứng gần nhân vật và cùng nhìn vào mê cung. Camera bám chậm ở nhịp đầu, dịch nhẹ để hé lộ điểm chắn ở nhịp hai, mở rộng vừa đủ sau cải cách. Tránh rung, xoay nhanh hoặc xuyên qua nhân vật/dây.
  - **Dây:** các mesh ống hoặc tiết diện tròn có độ dày thực, căng giữa các điểm nối. Phân lớp theo ba chiều: một sợi phía trước vai nhưng không che hết nhân vật, các sợi ngang ở xa, một vài sợi bắc chéo phía trên. Có che khuất, bóng đổ và phản sáng; không dùng đường đỏ 2D phủ màn hình làm hiệu ứng chính. Thứ tự phân lớp giữ được khi camera dịch chuyển.
  - **Không gian và ánh sáng:** nền đen pha burgundy, đỏ trầm chiếu dây, vàng ấm nhẹ tách nhân vật khỏi nền. Một số dây rõ, số khác chìm vào bóng tối; tập trung ánh sáng tại nút giao khó hiểu nhất. Vài chồng hồ sơ hoặc khối đầu mối ở xa làm bối cảnh, không lấp đầy sân khấu. Chữ đặt ở vùng riêng, tương phản cao.
  - **Nhịp 1 — Bước vào:** nhân vật tiến chậm vào không gian; camera theo sau, dây dần xuất hiện trong tầm nhìn. Dừng để người trình bày đặt tình huống.
  - **Nhịp 2 — Mất phương hướng:** hé lộ dây phân nhánh, giao nhau và quay trở lại; nhân vật dừng trước lối bị chắn. Camera dịch nhẹ, ánh sáng làm rõ nút thắt. Không thêm dây chuyển động liên tục khi đang giải thích.
  - **Nhịp 3 — Apply Reform:** chỉ bắt đầu khi người trình bày nhấn Space hoặc nút. Chuỗi diễn ra theo thứ tự: tập trung ánh sáng vào nút thắt → sắc đỏ giảm và xanh lan dọc từng nhóm dây, không đổi toàn bộ cùng lúc → hình học dây thực sự dịch chuyển, tách nút giao và tạo các luồng rõ hơn → ánh sáng môi trường tăng, giữ vàng ấm làm ánh sáng chủ đạo → camera mở rộng, nhân vật tiến vài bước rồi dừng. Không chỉ đổi màu hoặc fade dây cũ thành dây mới.
  - **Trạng thái giải thích:** giữ mô hình sau sắp xếp ổn định; ba động lực Economic change / Administrative effectiveness / International integration được làm nổi bật lần lượt bằng nhịp tiếp theo. Các nhịp này vẫn thuộc cảnh 3; chỉ sau phần kết luận mới sang cảnh 4. Màu xanh là tín hiệu luồng rõ hơn trong riêng cảnh này, không thay bảng màu toàn bài.
  - **Ý nghĩa:** dây tượng trưng cho quy trình chồng chéo, đầu mối giao nhau hoặc trách nhiệm chưa rõ; không kết luận toàn bộ hệ thống chính trị hỗn loạn. Chú thích “Illustrative workflow” luôn có mặt. Không tự thêm số bước, ngày xử lý hoặc tỷ lệ cải thiện; hình sau cải cách biểu đạt mục tiêu, không phải kết quả đo lường.
  - **Kiểm tra khi triển khai:** quan sát được độ dày, phân lớp và che khuất ở các góc camera; màu lan theo từng đoạn, hình học thay đổi thật; ánh sáng không cháy sáng, nhân vật không chiếm trọng tâm. Replay khôi phục đúng trạng thái; reduced motion chuyển nhẹ giữa các bố cục và giữ đủ nội dung. Fallback 2D giữ được nhân vật, nút thắt và luồng rõ hơn, không giả là 3D.
- **63 → 34 — cao trào 3D:** dùng ảnh bản đồ và bản đồ gỗ trong CPV làm tham khảo hình dáng, màu, vật liệu và bố cục để tạo mô hình nổi 3D. Ưu tiên hiệu ứng khiến người nghe cảm thấy “wow” và hiểu việc giảm đầu mối; không cần bám chính xác từng ranh giới hành chính. Các khối là đơn vị biểu tượng, không gán tên tỉnh hoặc mô phỏng quan hệ sáp nhập cụ thể khi chưa có dữ liệu tương ứng. Gắn nhãn nhỏ “Stylized illustration”.
  - BEFORE: 63 khối nổi có độ dày, cạnh sáng và bóng đổ, bố cục gợi hình chữ S của Việt Nam. Các đường kết nối nhiều nhánh tạo cảm giác nhiều đầu mối; chỉ minh họa, không suy rằng mọi đơn vị trước cải cách đều vận hành kém.
  - Nhấn Space: camera chuyển góc có chủ đích; các khối nâng lên, trượt và hội tụ theo nhóm, ánh sáng vàng chạy theo chuyển động. Mô hình giữ 11 khối không sáp nhập và biến 52 khối còn lại thành 23 khối đích, tổng 34; cách chia nhóm hình học chỉ minh họa, không gán tên hoặc tự nhận đúng từng quan hệ địa lý. Bộ đếm 63 → 34 đồng bộ với 34 khối đích; đường kết nối được sắp xếp rõ hơn. Dùng chuyển động mesh thực, vật liệu và ánh sáng 3D để tạo chiều sâu; không chỉ dissolve giữa hai ảnh phẳng.
  - AFTER: 34 khối lớn hơn tạo một tổng thể gọn, ánh sáng ổn định; camera dừng ở góc dễ quan sát. Hiện “Fewer administrative units · Clearer coordination” như ý nghĩa thiết kế và mục tiêu, không tuyên bố thời gian xử lý hoặc chi phí đã giảm nếu thiếu bằng chứng.
  - Nhấn Space tiếp: hiện sơ đồ chính quyền hai cấp; nhấn tiếp mới sang cảnh 6. Giữ Before/After/Comparison, Replay và ảnh tham khảo gốc có thể mở riêng. Chế độ giảm chuyển động dùng chuyển trạng thái nhẹ vẫn thể hiện rõ 63 → 34.
  - Giữ số liệu và ngày tháng chính xác; phân biệt hiệu lực nghị quyết tháng 6 với thời điểm chính quyền mới hoạt động ngày 1/7/2025. Phần nói giải thích tác dụng kỳ vọng của tinh gọn: giảm đầu mối, phối hợp rõ hơn; kết quả phục vụ thực tế còn phụ thuộc triển khai.
- **Âm thanh:** giấy, dấu, click và nhịp đồng hồ khi mê cung tăng phức tạp; whoosh khi chuyển cảnh; âm kết ngắn khi sắp xếp xong. Dừng hoặc hạ âm trong trạng thái giải thích. Không dùng nhạc nền liên tục hoặc âm thanh như bằng chứng chính sách thành công.

### Quiz

Cả bốn quiz có **bốn lựa chọn A–D**, nút Submit, phản hồi đúng/sai và giải thích. Kết quả và giải thích ẩn trước khi nộp; không tự chuyển cảnh; có Reset. Bỏ quiz “STUDENT RESPONSIBILITY”; ba cam kết sinh viên vẫn giữ trong cảnh nội dung 9. Bộ quiz hiện tại gắn Đại hội VI, cải cách năm 2025, bài học lấy dân làm gốc và Nghị quyết 18; giữ tổng cộng bốn quiz và 15 cảnh.

#### Cảnh 11 — INTERACTIVE QUESTION 1: ĐỔI MỚI 1986

**Question:** By the mid-1980s, Vietnam was in a socio-economic crisis under a centrally planned, subsidised economy. Which decision best matches the Party’s response at the Sixth National Congress in 1986?

- **A.** Tighten central planning and subsidies to restore control over production.
- **B.** Replace the socialist goal with a market model adopted from other countries.
- **C.** Postpone economic changes until political institutions had been reorganised first.
- **D.** Renew economic thinking and end the bureaucratic subsidy system, keeping the socialist goal.

**Correct Answer: D**

**Explanation:** The Sixth Congress, held in Hanoi on 15–18 December 1986, set out the line of comprehensive Đổi Mới. It called for renewing thinking, starting with economic thinking, and for ending the centrally planned, bureaucratic subsidy mechanism, and it is seen as a turning point in Vietnam’s transition to socialism. This is the starting point for later reforms of the political system; it does not show that any particular later reform has succeeded.

Căn cứ giáo trình trang 260–264. “Starting point” chỉ mốc mở đầu công cuộc Đổi Mới trong phạm vi bài, không nói hệ thống chính trị chỉ bắt đầu được xây dựng năm 1986. Đây là chủ trương chuyển đổi, không ngụ ý cơ chế cũ đã chấm dứt hoàn toàn ngay tại Đại hội.

#### Cảnh 12 — INTERACTIVE QUESTION 2: RESTRUCTURING

**Question:** Which description matches the local government model that began operating on 1 July 2025?

- **A.** 34 provincial-level units, with province and commune tiers.
- **B.** 63 provincial-level units, with province and commune tiers.
- **C.** 34 provincial-level units, with province, district, and commune tiers.
- **D.** 63 provincial-level units, with province, district, and commune tiers.

**Correct Answer: A**

**Explanation:** From 1 July 2025, local government has two tiers: province-level units (provinces and centrally run cities) and commune-level units (communes, wards and special zones), and the district level has ended. The model follows Party Central Committee Resolution 60-NQ/TW of 12 April 2025, and the National Assembly adopted Resolution 202/2025/QH15 on province-level units on 12 June 2025. This is an organizational change; whether services improve needs separate evidence.

Giữ Question và A–D như bản trước theo yêu cầu. Nguồn [1] bổ sung Luật 72/2025/QH15, Điều 1 về hai cấp và Điều 51 về kết thúc cấp huyện, để không quy toàn bộ cơ sở pháp lý của mô hình hai cấp cho Nghị quyết 202.

#### Cảnh 13 — INTERACTIVE QUESTION 3: PEOPLE AT THE CENTER

**Question:** The Sixth Congress (1986) put “take the people as the root” first among its main lessons. A commune offers online public services, but many older residents cannot complete the forms. Which action best applies this lesson?

- **A.** Count the online applications received and treat the total as the measure of success.
- **B.** Publish a written guide on the portal and ask residents to try again alone.
- **C.** Provide hands-on help with submitting and show residents how to track progress.
- **D.** Keep the online process unchanged and refer residents to relatives for help.

**Correct Answer: C**

**Explanation:** The Sixth Congress placed taking the people as the root first among its four main lessons, together with building and promoting the working people’s mastery. For public services, this means judging reform by whether residents can actually use and follow them. Hands-on help and progress tracking address the barrier directly; application counts, a written guide or a family referral do not show that it has been removed. A policy calling for such support does not establish that every resident has already received it.

Căn cứ lịch sử: giáo trình trang 262 về bốn bài học, trang 264 về phát huy quyền làm chủ; tổng kết sau này ở trang 405–406. Phần áp dụng vào dịch vụ số là liên hệ của nhóm, không phải nội dung công nghệ được nêu năm 1986. Ví dụ Hà Nội trong cảnh 7 minh họa cơ chế hỗ trợ, không mặc định mọi địa phương có kết quả giống nhau.

#### Cảnh 14 — INTERACTIVE QUESTION 4: ONE TASK, ONE LEAD

**Question:** Resolution 18-NQ/TW (2017) sets the principle that an agency may handle many tasks, but each task should have one lead agency with main responsibility. Three offices now review the same permit application, and each waits for the others. Which arrangement best follows this principle?

- **A.** Keep the three reviews running in parallel and combine the opinions at the end.
- **B.** Name one office as lead with main responsibility, and have the others coordinate through it.
- **C.** Merge the three offices into one but keep the same three review steps.
- **D.** Ask the applicant to coordinate between the offices and report any conflicts.

**Correct Answer: B**

**Explanation:** Resolution 18-NQ/TW (25 October 2017) of the 12th Central Committee calls for a political system that is streamlined and works effectively and efficiently; it names overlapping functions and weak accountability among the problems to solve. Merging offices, running reviews in parallel or passing coordination to citizens does not make responsibility clear. The example is illustrative and does not show how far overlap has been reduced in practice.

Căn cứ Nghị quyết 18, phần II.1 (quan điểm chỉ đạo) và III.1 (nhiệm vụ, giải pháp chung). Một cơ quan chủ trì không đồng nghĩa bỏ thẩm quyền chuyên môn hoặc trách nhiệm phối hợp của cơ quan khác. Trong tình huống này, những phương án còn lại tự chúng chưa giải quyết việc thiếu đầu mối chịu trách nhiệm chính.

Bốn quiz dùng bản nội dung mới do người dùng cung cấp, thay toàn bộ nội dung quiz 1/3/4 trước đó; quiz 2 chỉ thay Explanation. Đáp án D–A–C–B. Không tự xáo khi trình chiếu; lưu đáp án theo ID. Phản hồi sau Submit giữ đầy đủ giải thích, có thể chia 2 nhịp hoặc đặt đoạn diễn giải chi tiết trong panel để bảo đảm chữ đọc được; không tự chuyển cảnh. Phần người nói diễn giải bằng câu ngắn, tránh đọc nguyên đoạn dài.

### Cách khán giả tham gia quiz

Người trình bày đọc câu hỏi, cho lớp suy nghĩ khoảng 10 giây, rồi đọc lần lượt A/B/C/D để khán giả giơ tay chọn. Người trình bày chọn phương án có nhiều người ủng hộ nhất trên màn hình và nhấn Submit; nếu hòa, mời một người giải thích ngắn rồi chốt lựa chọn. Sau phản hồi, có thể mời một người nêu lý do hoặc trả lời câu hỏi miệng trong notes. Không mặc định phải cử đại diện hoặc dùng điện thoại/Internet. Phần mềm không tự đếm tay hoặc tạo tỷ lệ bình chọn giả. Người trình bày điều khiển chuyển cảnh sau khi giải thích.

### Làm rõ ẩn dụ ngay trong cảnh

Không bổ sung bài thử 5 giây hoặc yêu cầu thử với người ngoài theo chỉ dẫn mới. Dùng điểm neo dễ nhận ra trong thiết kế: cảnh 3 có người dân cầm hồ sơ, điểm tiếp nhận, lối bị chắn và nhãn ngắn “Repeated steps” / “Unclear responsibility”; cảnh 5 có số 63 → 34 và “Provincial-level units”; cảnh 7 có “Submit / Process / Track / Receive” cùng bàn “Help”. Mạng điểm sáng chỉ nối mạch kể chuyện, không thay sơ đồ có nhãn khi giải thích thành phần hệ thống. Hình ảnh phải cho thấy vấn đề và hành động; lời nói cung cấp ý nghĩa chính sách và giới hạn của minh họa.

## 4. Thiết kế, kiến trúc và giao diện

### Thị giác và công nghệ

- Nền gần đen, burgundy, ivory và vàng; navy làm lớp chiều sâu, cyan dùng riêng cho kênh dịch vụ số; xanh lá dùng cho luồng được sắp xếp rõ hơn ở cảnh 3. Hai màu có ý nghĩa riêng, không thay thế nhau. Font Georgia cho display và Segoe UI/Arial cho nội dung, đều có fallback hệ thống; không gọi Google Fonts.
- Sân khấu thiết kế 1600 × 900, co theo tỷ lệ 16:9 cho máy chiếu. Cảnh có bố cục riêng; chữ và nguồn đặt trong vùng an toàn 5%. Portrait nhỏ có chế độ đọc xếp dọc từ cùng dữ liệu, không cắt nội dung hoặc chỉ thu nhỏ mọi chữ.
- Dùng một renderer Three.js/WebGL2 chung cho mạng lưới, camera và hồ sơ 3D. Chữ, controls, nguồn và quiz là DOM; sơ đồ và ngọn lửa là SVG. Cảnh 63 → 34 dùng các mesh nổi cách điệu, tham khảo ảnh trong CPV; ảnh gốc lưu riêng để đối chiếu.
- Trong giai đoạn phát triển, đóng gói Three.js thành runtime nhúng trong HTML, giữ thông tin giấy phép. Dùng Web Animations/CSS và timeline JavaScript chung để điều phối; không cần thêm GSAP chỉ để tăng số thư viện. File cuối không có import bên ngoài, fetch tài nguyên hoặc CDN.
- Có chất lượng Cao/Thấp và chế độ 2D SVG/Canvas khi WebGL2 không có hoặc mất context. Giảm chuyển động vẫn giữ đủ trạng thái, chữ và tương tác. Không chạy animation trên cảnh ẩn hoặc tab ẩn.

### Mô hình dữ liệu

Tách dữ liệu khỏi renderer. Các cấu trúc nội bộ cần có:

- `presentation`: tên, chủ đề, nhóm, thành viên, ngôn ngữ chú giải và thời lượng.
- `scenes[]`: ID ổn định, thứ tự, chương, nội dung, facts, nguồn, layout, các beats, kịch bản tiếng Anh, câu chuyển ý, thời gian và câu hỏi dự kiến.
- `objects[]`: ID, loại text/image, nội dung hoặc asset ID, tọa độ sân khấu, kích thước, scale, rotation, opacity, font, màu và depth.
- `assets`: ID, MIME, kích thước, dữ liệu nhúng, bản gốc và bản đã xử lý nếu có. Không nhân đôi ảnh trong mỗi snapshot undo.
- `references`: tách nguồn gốc chưa khôi phục khỏi nguồn đối chiếu đã xác minh; lưu publisher, title, URL, ngày, facts được hỗ trợ và tình trạng kiểm tra.
- Runtime: cảnh/beat hiện tại, transition token, mode, lựa chọn editor, quiz, âm thanh và chất lượng. Không dùng DOM clone làm nguồn dữ liệu chính.

### Điều khiển và ghi chú

- Space/Right/PageDown: nhịp tiếp; hết nhịp mới sang cảnh tiếp. Left/PageUp: nhịp trước; đầu cảnh quay về nhịp cuối cảnh trước. PageDown/PageUp hỗ trợ bút trình chiếu thông dụng; vẫn áp dụng quy tắc bỏ qua phím khi đang nhập liệu.
- F fullscreen; G overview 15 thumbnail; Escape đóng panel cao nhất trước; E editor; R phát lại chuyển động nhịp hiện tại; M mute; N mở ghi chú riêng.
- Wheel có cooldown 650 ms; swipe ngang dùng cùng thao tác next/previous. Có nút thay thế cho các thao tác thiết yếu, hiện khi tương tác/focus/tap; không phủ toolbar editor lên màn chiếu ban đầu.
- Bỏ qua phím điều hướng khi focus ở input, textarea, contenteditable, select hoặc controls cần Space. Rapid navigation hủy công việc cũ; trạng thái đích luôn thắng.
- N mở cửa sổ riêng của cùng HTML ở chế độ presenter, nhận trạng thái từ cửa sổ chiếu. Chỉ cửa sổ này hiển thị script, nguồn, câu chuyển ý và timer. Nếu popup bị chặn hoặc không đồng bộ, có bản script tải xuống/in được; không tự đưa notes lên màn chiếu. Trình chiếu bằng chế độ mở rộng màn hình, không giả định việc chia cửa sổ che được notes khi người dùng mirror toàn bộ desktop.
- Âm thanh mặc định tắt. Chỉ bật sau thao tác người dùng; có mute và volume; Web Audio tạo hiệu ứng từ oscillators/noise/envelopes, không tải âm thanh ngoài. Replay không tự bỏ mute hay reset đáp án.

### Chỉnh sửa và xuất HTML

- E mở “Chỉnh sửa slide”, mặc định “Chưa có thay đổi”. Click chọn; ảnh kéo trực tiếp, chữ giữ Shift để kéo. Đổi tọa độ theo sân khấu; tách transform chỉnh sửa khỏi transform camera/parallax.
- Đủ bảy slider: Phóng to, Xoay, Độ mờ, Cỡ chữ, Độ nhạy tách nền, Chiều sâu parallax, Phối cảnh camera; có Màu chữ. Disable thuộc tính không áp dụng cho đối tượng đang chọn, không thay đối tượng khác.
- Đủ Thay ảnh, Xóa nền, Kiểm tra, Thêm chữ, Hoàn tác, Làm lại, Lưu file. Thay ảnh PNG/JPEG/WebP tại vị trí đang chọn; giữ tỷ lệ và nhúng dữ liệu ảnh vào export.
- Xóa nền thực hiện color-distance và flood fill từ mép ảnh cho nền tương đối đồng nhất, có preview trước/sau, sensitivity, Apply/Cancel và giữ ảnh gốc. Không tự gọi đây là AI segmentation hoặc báo thành công đối với mọi nền phức tạp.
- Undo/redo theo thao tác, tối đa 100 thao tác; gộp một drag hoặc một phiên kéo slider thành một entry. Bao phủ chữ, hình, transform, màu, xử lý ảnh và tạo text.
- Kiểm tra chạy thực: tràn sân khấu, ảnh hỏng, tỷ lệ ảnh, đối tượng rỗng/vô hình, reference, quiz, nguồn ngoài, state và lỗi runtime đã ghi nhận. Phân biệt lỗi xác định với cảnh báo che lấp/thiếu nguồn gốc; không giả vờ chấm được toàn bộ thẩm mỹ hoặc tính đúng của mọi nhận định.
- Lưu file serialize dữ liệu mới nhất cùng runtime/CSS/SVG/asset registry thành HTML hoàn chỉnh. Escape JSON để không phá thẻ script; render nội dung chữ an toàn. Không export blob URL, đường dẫn máy hoặc lịch sử trạng thái tạm của editor. File mở lại ở presentation mode; quiz chưa trả lời; giữ toàn bộ chỉnh sửa. Undo/redo mới có hạ tầng hoạt động, không cần mang toàn bộ lịch sử phiên cũ.

## 5. Nội dung học thuật và nguồn

Khái niệm, lịch sử và phạm vi cải cách phải có nguồn; không đồng nhất toàn bộ cải cách hệ thống chính trị với sáp nhập tỉnh. Luận điểm chính: thay đổi tổ chức cần được xem cùng phân định trách nhiệm, năng lực triển khai, minh bạch và trải nghiệm người dân.

Các tài liệu [1]–[5] gốc chưa được khôi phục đầy đủ từ file hoặc chat chia sẻ. Giữ thông tin chủ đề và trạng thái thiếu nguồn gốc trong dữ liệu/handover; các văn bản dưới đây được ghi rõ là **nguồn đối chiếu bổ sung**, không nhận là thư mục gốc đã tìm lại:

| Nhóm | Nguồn đối chiếu sử dụng |
| --- | --- |
| [1] Chủ trương Đảng, thể chế hóa và hai cấp | [Nghị quyết 60-NQ/TW, 12/4/2025](https://tulieuvankien.dangcongsan.vn/home/chu-truong-chinh-sach-moi/nghi-quyet-hoi-nghi-lan-thu-11-ban-chap-hanh-trung-uong-dang-khoa-xiii-4274); [Nghị quyết 202/2025/QH15](https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-quyet-so-202-2025-qh15-ve-sap-xep-don-vi-hanh-chinh-cap-tinh-119250612174148722.htm); [Luật 72/2025/QH15](https://xaydungchinhsach.chinhphu.vn/toan-van-luat-so-72-2025-qh15-to-chuc-chinh-quyen-dia-phuong-119250618161434371.htm) |
| [2] Nguyên tắc phòng, chống tham nhũng và cơ chế thực hiện | [Báo cáo chính trị Đại hội XIV, phần phương hướng phòng, chống tham nhũng](https://tulieuvankien.dangcongsan.vn/bo-chinh-tri-ban-bi-thu-ban-chap-hanh-trung-uong/dai-hoi-dang/lan-thu-xiv/bao-cao-chinh-tri-cua-ban-chap-hanh-trung-uong-khoa-xiii-tai-dai-hoi-dai-bieu-toan-quoc-lan-thu-xiv-cua-dang.html); [Nghị định 130/2020/NĐ-CP](https://vanban.chinhphu.vn/?docid=201480&pageid=27160) |
| [3] Dịch vụ công số Hà Nội | [Kế hoạch 12/KH-UBND](https://vanban.hanoi.gov.vn/chi-tiet-van-ban/ke-hoach-trien-khai-chuong-trinh-pho-cap-dich-vu-cong-so-232118); [bài cơ quan địa phương về 126 xã/phường](https://kienhung.hanoi.gov.vn/cai-cach-hanh-chinh-chuyen-doi-so/pho-cap-dich-vu-cong-so-cho-nguoi-dan-va-doanh-nghiep-tai-126-xa-phuong-2810260110160014629.htm) |
| [4] Đại hội và mục tiêu | [Nghị quyết Đại hội XIV](https://tulieuvankien.dangcongsan.vn/tin-hoat-dong/nghi-quyet-dai-hoi-dai-bieu-toan-quoc-lan-thu-xiv-cua-dang.html) |
| [5] Cải cách thủ tục 2026–2030 | [Nghị quyết 258/NQ-CP](https://vanban.chinhphu.vn/?classid=2&docid=219353&pageid=27160), văn bản bổ sung ban hành 31/8/2026; không giả định đây là nguồn gốc của tài liệu cũ |
| Nền tảng | Giáo trình đã cung cấp và [Nghị quyết 18-NQ/TW ngày 25/10/2017](https://tulieuvankien.dangcongsan.vn/van-kien-tu-lieu-ve-dang/hoi-nghi-bch-trung-uong/khoa-xii/nghi-quyet-so-18-nqtw-ngay-25102017-hoi-nghi-lan-thu-sau-ban-chap-hanh-trung-uong-dang-khoa-xii-mot-so-van-de-ve-tiep-568) |

Trang Hà Nội đã tìm thấy qua nguồn chính thức nhưng tải trực tiếp từng có timeout; cần đọc đầy đủ tài liệu liên quan trước khi khóa câu diễn giải. Chỉ nói kế hoạch phổ cập kỹ năng sử dụng dịch vụ công số, không suy thành kết quả đã đo được. Sơ đồ chính quyền chính giữ province/city → commune/ward theo prompt; giải thích đầy đủ cấp xã có xã, phường, đặc khu trong nguồn/notes.

### Căn cứ giáo trình, bài học lịch sử và notes bổ sung

Các trang dưới đây đã được đọc trực quan trong bản giáo trình người dùng cung cấp. Giữ số trang sách trong notes, không gán chúng thành số trang của Văn kiện Đảng được chú thích trong sách.

| Nội dung | Trang sách (trang PDF) | Cách đưa vào bài |
| --- | --- | --- |
| Đại hội VI, khủng hoảng và đổi mới tư duy, cơ chế quản lý | 260–264 (132–134) | Cảnh 4 và quiz 1; chủ trương Đổi Mới toàn diện, không nói mọi thay đổi hoàn thành ngay năm 1986 |
| Bài học đầu tiên trong bốn bài học Đại hội VI: lấy dân làm gốc | 262 (133); quyền làm chủ ở 264 (134) | Quiz 3 và lời giải; liên hệ với khả năng người dân thực sự sử dụng dịch vụ |
| Hội nghị Trung ương 3 khóa VII, tháng 6/1992: đổi mới, chỉnh đốn Đảng và phương thức lãnh đạo | 281–282 (142–143) | Mốc cầu nối thứ nhất trong notes cảnh 4, không thêm slide |
| Cương lĩnh bổ sung, phát triển năm 2011: hệ thống chính trị và phương thức lãnh đạo | 346–348 (175–176) | Mốc cầu nối thứ hai trong notes; căn cứ sơ đồ cảnh 2 |
| Bài học về xây dựng, chỉnh đốn Đảng, hệ thống chính trị và kiểm soát quyền lực | 404–405 (204) | Notes cảnh 6 và 9: trách nhiệm, năng lực và liêm chính phải đi cùng tổ chức |
| Bài học lấy dân làm gốc, xuất phát từ nhu cầu và lợi ích chính đáng của nhân dân | 405–406 (204–205) | Notes cảnh 7 và 10: đánh giá khả năng tiếp cận và trải nghiệm người dân |
| Bài học tổ chức thực hiện: trách nhiệm người đứng đầu, phối hợp, tổng kết thực tiễn và hiệu quả thực tế | 406 (205) | Notes cảnh 5, 9 và lời chốt; liên hệ phân công nhóm là vận dụng học tập, không đồng nhất nhóm với cơ quan nhà nước |

Ba ý ngắn để nói ở cảnh 9–10: “Build capable and accountable institutions.” / “Start from people’s needs.” / “Judge implementation by practical results.” Đây là diễn giải tiếng Anh của nhóm, không phải trích dẫn nguyên văn. Phần kết giáo trình còn có các bài học khác; chỉ chọn ba ý phù hợp đề bài, không gọi đây là toàn bộ tổng kết.

Notes cầu nối cảnh 4: “The process continued between these milestones. In 1992, the Third Plenum of the Seventh Central Committee addressed Party renewal and rectification. The 2011 Platform further clarified the political system and the Party’s leadership methods.” Hai mốc giữ trong notes/Q&A, không biến timeline thành bảng nhiều năm.

### Căn cứ văn kiện Đảng và cách phân vai trong ví dụ 2025

- **[P1] Nghị quyết 60-NQ/TW, 12/4/2025:** [toàn văn trên cổng Tư liệu – Văn kiện](https://tulieuvankien.dangcongsan.vn/home/chu-truong-chinh-sach-moi/nghi-quyet-hoi-nghi-lan-thu-11-ban-chap-hanh-trung-uong-dang-khoa-xiii-4274), mục 5. Trung ương khóa XIII thống nhất chủ trương mô hình hai cấp và 34 đơn vị cấp tỉnh. Đây là căn cứ về chủ trương cho cảnh 4–5 và quiz 2.
- **[P2] Cương lĩnh 2011:** [toàn văn, phần IV](https://tulieuvankien.dangcongsan.vn/ban-chap-hanh-trung-uong-dang/dai-hoi-dang/lan-thu-xi/cuong-linh-xay-dung-dat-nuoc-trong-thoi-ky-qua-do-len-chu-nghia-xa-hoi-bo-sung-phat-trien-nam-2011-1528). Đối chiếu vai trò lãnh đạo và phương thức lãnh đạo của Đảng với giáo trình trang 346–348; dùng cho cảnh 2 và Q&A.
- **[P3] Báo cáo chính trị tại Đại hội XIV:** [toàn văn](https://tulieuvankien.dangcongsan.vn/bo-chinh-tri-ban-bi-thu-ban-chap-hanh-trung-uong/dai-hoi-dang/lan-thu-xiv/bao-cao-chinh-tri-cua-ban-chap-hanh-trung-uong-khoa-xiii-tai-dai-hoi-dai-bieu-toan-quoc-lan-thu-xiv-cua-dang.html), đoạn phương hướng bắt đầu bằng nội dung kết hợp phòng ngừa với phát hiện, xử lý. Dùng cho nguyên tắc NO EXCEPTIONS ở cảnh 6; phân biệt phương hướng với đánh giá kết quả thực hiện.

Chuỗi minh họa năm 2025: **Đảng đề ra chủ trương → Quốc hội thể chế hóa qua nghị quyết và luật → Chính phủ, chính quyền địa phương tổ chức thực hiện theo thẩm quyền**. Nghị quyết 202 ngày 12/6/2025 quy định sắp xếp đơn vị cấp tỉnh; Luật 72 ngày 16/6/2025 quy định tổ chức chính quyền địa phương, gồm hai cấp và việc kết thúc cấp huyện từ 1/7. Sơ đồ là bản rút gọn vai trò trong ví dụ, không khẳng định chỉ ba văn bản này cấu thành toàn bộ quá trình hoặc Đảng trực tiếp giải quyết mọi hồ sơ hành chính.

### Q&A cho người trình bày

**What is the Party’s role in reforming the political system?**

“The Party sets major orientations and leads through policy, organisation, personnel, inspection, and supervision. It leads the political system and is also part of it. State institutions turn these orientations into legal rules and carry out their duties under the law.” Căn cứ giáo trình trang 347–348, Cương lĩnh 2011 phần IV. Dùng chuỗi Nghị quyết 60 → Nghị quyết 202/Luật 72 → triển khai để minh họa, phân biệt vai trò từng cơ quan.

**Does Đổi Mới mean changing the socialist goal?**

“No. The Sixth Congress renewed thinking and the management mechanism while keeping the socialist goal. Later reforms must be understood in their own historical contexts.” Căn cứ giáo trình trang 260–264; không gán chi tiết chính sách 2025 cho Đại hội VI.

**Does having one lead agency mean that other agencies have no responsibility?**

“No. One agency has the main coordinating responsibility. Other agencies still perform their duties and cooperate within their authority.” Căn cứ Nghị quyết 18, phần II.1 và III.1; vận dụng vào tình huống quiz 4.

**Does ‘no exceptions’ describe what happens in every case?**

“It states a policy principle in the Party’s documents. Consistent implementation needs evidence.” Căn cứ Báo cáo chính trị Đại hội XIV, phần phương hướng phòng, chống tham nhũng.

**How does the group apply these lessons?**

“We check original sources, divide tasks clearly, review one another’s work, and explain what the evidence can and cannot show.” Chuyển sang quá khứ hoặc nói đã làm chỉ sau khi nhóm điền và xác nhận công việc thực tế.

### Thuật ngữ tiếng Anh dùng thống nhất trong notes

Đây là quy ước biên tập của nhóm, không nhận là bản dịch chính thức của từng văn kiện. Lần đầu ghi tên đầy đủ và mã văn kiện; lần sau dùng tên ngắn. Giữ bản tiếng Việt trong nguồn để đối chiếu.

| Tiếng Việt | Cách dùng tiếng Anh |
| --- | --- |
| Đảng Cộng sản Việt Nam | Communist Party of Vietnam (CPV); sau đó the Party |
| Đổi Mới | Đổi Mới (Renovation) ở lần đầu; sau đó Đổi Mới |
| Đại hội đại biểu toàn quốc lần thứ VI | Sixth National Congress of the Communist Party of Vietnam; sau đó Sixth Congress |
| Ban Chấp hành Trung ương khóa XIII | 13th Central Committee; không gọi là 13th National Congress khi nói cơ quan này |
| Hội nghị lần thứ 11 BCH Trung ương khóa XIII | 11th Plenum of the 13th Central Committee |
| Hội nghị Trung ương 3 khóa VII | Third Plenum of the Seventh Central Committee |
| Nghị quyết 60-NQ/TW | Party Central Committee Resolution No. 60-NQ/TW (12 April 2025) |
| Nghị quyết 18-NQ/TW | Resolution No. 18-NQ/TW of the 12th Central Committee (25 October 2017) |
| Cương lĩnh (bổ sung, phát triển năm 2011) | Platform for National Construction in the Period of Transition to Socialism (supplemented and developed in 2011); sau đó the 2011 Platform |
| Báo cáo chính trị tại Đại hội XIV | Political Report to the 14th National Party Congress |
| Quốc hội; Chính phủ | National Assembly; Government — không dùng thay cho nhau |
| Nghị quyết 202/2025/QH15; Luật 72/2025/QH15 | National Assembly Resolution No. 202/2025/QH15; Law No. 72/2025/QH15 on Organisation of Local Government |
| Đảng lãnh đạo, Nhà nước quản lý, nhân dân làm chủ | Party leadership, State management, and the people’s mastery |
| Lấy dân làm gốc | take the people as the root; diễn giải khi nói: put people at the centre |
| Chính quyền địa phương hai cấp | two-tier local government |
| Tinh gọn, hoạt động hiệu lực, hiệu quả | streamlined, effective and efficient |
| Trách nhiệm chính; trách nhiệm giải trình | main responsibility; accountability — không mặc định đồng nghĩa |
| Phòng, chống tham nhũng, lãng phí, tiêu cực | prevention and combat of corruption, wastefulness and misconduct |

Không kéo dài phần nói chính để đọc mọi tên văn kiện. Giữ các tên đầy đủ, ngày tháng và Q&A trong notes; trên màn hình chỉ hiển thị nhãn ngắn đủ nhận diện. Thời lượng 11 phút và cảnh 3 khoảng 2 phút 20 giây tiếp tục là dự toán; tập dượt để điều chỉnh câu nói, không tăng số cảnh.

### Cơ chế hỗ trợ tại Hà Nội — bổ sung cho cảnh 7 và liên hệ quiz 3

- [Chỉ đạo chiến dịch 45 ngày đêm tại 126 xã/phường](https://hanoi.gov.vn/chi-dao-cua-ubnd-thanh-pho-ha-noi/trien-khai-chien-dich-45-ngay-dem-ra-quan-thuc-day-chuyen-doi-so-tai-126-xa-phuong-4250725120506197.htm): đoạn trích tìm kiếm từ cổng chính thức xác nhận yêu cầu triển khai điểm “Bình dân học vụ số lưu động”, dịch vụ công lưu động và bố trí nhân lực, thiết bị. Trang trực tiếp timeout; chỉ dùng nội dung đã thấy, chưa tuyên bố đã đọc toàn văn. Chi tiết về Tổ chuyển đổi số cộng đồng và tổ ứng cứu công nghệ do người dùng nêu cần đối chiếu thêm trước khi đưa thành khẳng định cụ thể.
- [Thí điểm Điểm Phục vụ hành chính công cộng đồng](https://ttpvhcc.hanoi.gov.vn/cai-cach-hanh-chinh-va-tin-khac/ha-noi-thi-diem-mo-hinh-diem-phuc-vu-hanh-chinh-cong-cong-dong-dua-dich-vu-hanh-chinh-den-gan-hon-voi-nguoi-dan-2850251013100510157.htm): đoạn trích chính thức nêu kế hoạch giai đoạn 1 từ tháng 10/2025 đến hết 2026 tại 2–3 địa điểm; từ 2027 đánh giá và nhân rộng. Đây là phạm vi kế hoạch thí điểm, không đồng nghĩa đã phủ toàn bộ 126 xã/phường. Trang trực tiếp timeout; cần đọc toàn văn trước khi mô tả sâu.

### Nguồn phân tích bổ sung ngoài văn bản nhà nước

- [World Bank — Viet Nam 2045: Breaking Through, Institutions for a High-Income Future](https://www.worldbank.org/en/country/vietnam/publication/viet-nam-2045-breaking-through-institutions-for-a-high-income-future): trang giới thiệu báo cáo đã đọc. Dùng góc nhìn chức năng thể chế, năng lực thực thi và trách nhiệm, thay vì chỉ nhìn hình thức tổ chức; bổ trợ cảnh 3, 5 và 10. Đây là phân tích và khuyến nghị, không chứng minh kết quả của đợt sáp nhập cụ thể.
- [UNDP — PAPI 2024 và cơ hội cải thiện quản trị địa phương](https://www.undp.org/vietnam/press-releases/new-papi-report-government-reforms-offer-historic-opportunity-enhance-local-governance-all): tìm thấy thông cáo chính thức ngày 15/4/2025; tải trực tiếp từng timeout, cần đọc đầy đủ báo cáo trước khi dùng số liệu. Dùng để xây tiêu chí đánh giá từ trải nghiệm người dân. Dữ liệu năm 2024 có trước thay đổi tháng 7/2025, không dùng làm đánh giá kết quả sau sáp nhập. PAPI có các đối tác nghiên cứu trong nước; gọi đây là góc nhìn khảo sát/phân tích ngoài văn bản chính sách, không mô tả là hoàn toàn độc lập với mọi đối tác Việt Nam.

Bảng claim–source phân loại rõ **Verified change / Policy goal / Demonstrated outcome**. Chỉ gắn nhãn kết quả đã chứng minh khi nguồn có dữ liệu và phương pháp phù hợp; mô hình mê cung và 3D là minh họa. Các nguồn nằm trong notes/dữ liệu/handover, không thêm lại cảnh nguồn.

## 6. Trình tự triển khai và nghiệm thu

1. **Khóa nội dung và dẫn chứng:** lập bảng claim–source, đọc phần giáo trình liên quan, hoàn chỉnh script tiếng Anh khoảng 1.100–1.250 từ theo nhịp nói và 11 phút mặc định. Tách mục tiêu, thay đổi tổ chức đã xác minh và kết quả chưa được chứng minh. Chuẩn bị Q&A, phân công trống có thể sửa và rubric mapping.
2. **Storyboard và thử kỹ thuật:** dựng ngôn ngữ thị giác chung; hoàn thiện mở đầu, mê cung và bản đồ trước. Kiểm tra WebGL fallback, thao tác từng nhịp, giữ chữ ổn định, audio bật/tắt và khả năng mở bằng `file://` trước khi nhân rộng.
3. **Hoàn thiện toàn bộ sản phẩm (sau khi người dùng yêu cầu triển khai):** đủ 15 cảnh, quizzes, nguồn trong dữ liệu/notes, âm thanh, editor, undo/redo, validation và export. Đồng bộ mọi phần với cùng dữ liệu, không có nút trang trí không hoạt động.
4. **Kiểm tra và tinh chỉnh:** kiểm tra trình duyệt thực, cả chuyển động và trạng thái dừng; sửa lỗi rồi đóng gói một HTML. Chỉ thay file đích sau khi kiểm tra bản mới. Bàn giao hướng dẫn, script, Q&A, rubric và báo cáo kiểm thử qua nội dung có thể tải/in từ file hoặc tài liệu Markdown bổ trợ; không bắt người dùng mở dự án phát triển.

### Bộ kiểm tra bắt buộc

- **Nội dung:** chính xác 15 cảnh và thứ tự; không có cảnh nguồn riêng hoặc cảnh hai câu hỏi thảo luận mở; cảnh cuối chỉ “Thank you for listening”, không quốc kỳ; các số 63/34, ngày 1/7/2025, hai cấp, bỏ cấp huyện; ba hành động liêm chính, bốn bước dịch vụ số, cam kết nhóm, mục tiêu 2030/2045; đủ bốn quiz, mỗi quiz bốn lựa chọn A–D và giải thích; không có quiz Student Responsibility; tất cả claim quan trọng có nguồn hoặc qualification; đúng vai trò lãnh đạo của Đảng, chuỗi chủ trương–thể chế hóa–thực hiện năm 2025 và số trang giáo trình trong notes; không đồng nhất chính sách với kết quả.
- **Hình ảnh:** từng cảnh ở 1366 × 768 và 1920 × 1080; các trạng thái mê cung và bản đồ; nhân vật cảnh 3/7 giữ cùng hình dáng và vật liệu, cyan/xanh lá đúng vai trò, bàn hỗ trợ nằm trong hành trình; cảnh 10 phân biệt triển khai 2025–26 với mục tiêu 2030/2045; mô hình 63 → 34 đúng số khối ở hai trạng thái, chuyển động hội tụ rõ và dừng dễ đọc; ảnh tham khảo gốc không méo/cắt/mất quần đảo; không chữ tràn, không notes/editor hiện ban đầu. Bản portrait vẫn đọc được nội dung chính.
- **Điều khiển:** mọi shortcut, wheel/swipe/thumbnail, focus modal, gõ bình thường và rapid navigation. Replay chỉ phát lại nhịp; quiz không tự advance; timer và progress đúng cảnh/beat.
- **Âm thanh:** chưa có gesture thì không phát; mute/volume hoạt động; không chồng cue cũ sau navigation; explanation yên; tab ẩn ngừng âm/chuyển động theo state; trình chiếu im lặng vẫn đủ nghĩa.
- **Editor:** đổi chữ, vị trí, scale/rotation/opacity, font/màu, parallax/camera; thêm text, thay ảnh, tách nền preview; undo/redo thực tế; validator phát hiện ảnh hỏng và text tràn được cố ý tạo trong bản test.
- **Export:** sửa dữ liệu, xuất HTML, mở file xuất ở vị trí khác, ngắt mạng và kiểm tra lại nội dung, hình ảnh, scene/quiz/editor. Không còn resource bắt buộc ngoài file; không giữ blob URL hoặc đường dẫn nguồn.
- **Resilience:** reduced motion; chất lượng thấp; WebGL2 không có hoặc mất context; asset lỗi; fullscreen/popup bị chặn. Nội dung và điều hướng vẫn dùng được.
- **Báo cáo:** ghi trình duyệt/thiết bị thực sự đã dùng, kết quả quan sát, test chưa chạy và lỗi còn lại. Không bịa FPS hoặc tuyên bố đã kiểm tra phần cứng không có.

### Điều kiện hoàn thành

Một người thuyết trình có thể mở file offline, điều khiển bài, cho khán giả xem được tất cả luận điểm, thực hiện tương tác quiz, chỉnh sửa nội dung và lưu bản HTML mới hoạt động đầy đủ. Hiệu ứng có thể dừng, phát lại hoặc bỏ qua mà không mất thông tin. Handover phân biệt rõ chức năng đã làm/đã thử/chưa thử và các đầu vào còn thiếu.

## 7. Rà soát trước khi xây dựng HTML — 11/10/2026

**Kết luận:** đã đủ định hướng để triển khai khi người dùng yêu cầu; chưa phải bản đặc tả nội dung cuối cùng hoặc sản phẩm đã kiểm thử. Chỉ bắt đầu tạo HTML khi người dùng nhắn “bắt đầu xây dựng file html”. Không thêm bài thử 5 giây với người ngoài.

### Thông tin cần người dùng cung cấp nếu đã biết

1. Giới hạn thời gian có bao gồm bốn quiz không? Dự toán hiện tại là 11 phút nói cộng khoảng 4–6 phút đọc câu hỏi, giơ tay và giải thích, tức khoảng 15–17 phút tổng. Đây là ước lượng cần điều chỉnh sau tập dượt, không phải thời lượng do giảng viên xác nhận.
2. Máy dùng trình chiếu: mẫu máy hoặc CPU/RAM/GPU nếu biết; có thể dùng chế độ Extend để notes riêng không? Không cần thông tin nhạy cảm hoặc cấu hình chi tiết nếu người dùng không biết. Nếu chưa rõ, thiết kế có chất lượng tự điều chỉnh, nút chuyển chất lượng và script in/tải được; hiệu năng cần kiểm tra thực tế sau khi có bản dựng.
3. Số người trực tiếp nói để chia chương. Đã có bốn tên thành viên; chưa xác nhận số người trực tiếp nói. Phân công và bằng chứng hoàn thành tiếp tục để trống đến khi nhóm điền.

Chưa có câu trả lời thì giữ các giả định trên trong kế hoạch, không tự coi chúng đã được người dùng xác nhận và không coi câu trả lời là lệnh bắt đầu xây HTML.

### Phần người xây dựng cần hoàn thiện, không cần người dùng quyết định thay

- **Kịch bản và bảng từng nhịp:** hiện có storyboard và nhiều câu gợi ý, chưa có script hoàn chỉnh 1.100–1.250 từ. Trước khi khóa nội dung, mỗi cảnh cần đủ chữ hiển thị, lời nói, trạng thái đầu/cuối, thao tác tiến/lùi, thời gian và nguồn. Cảnh 1/8/15 cần nhịp chuyển cụ thể; cảnh 4/5 cần giảm lượng tên văn kiện đọc thành lời để giữ thời gian và phần phân tích. Ghi chú dài để tham khảo không đồng nghĩa phải đọc hết.
- **Nguồn còn kiểm tra:** tài liệu Hà Nội và PAPI có phần mới đọc đoạn trích; chỉ dùng claim đã kiểm tra, đọc đầy đủ trước khi đưa số liệu hoặc tên cơ chế chưa xác nhận. Nguồn World Bank đã đọc trang giới thiệu, không tự nhận đã đọc cả báo cáo. Lập sổ nguồn có ID ổn định, tên, ngày, URL/trang sách, claim hỗ trợ; tránh mã [1] và [P1] gây nhầm. Bỏ cảnh nguồn riêng vẫn giữ trích dẫn nhỏ và nguồn trong notes. Metadata nguồn gốc chưa khôi phục thuộc hồ sơ bàn giao, không thành cảnh báo nổi giữa bài.
- **Quiz và khả năng đọc:** giữ nguyên bản quiz mới được người dùng cung cấp. Bốn lựa chọn bố trí 2×2 khi đủ chỗ, cỡ chữ theo khoảng cách máy chiếu. Sau Submit hiện kết quả ngắn trước; nhịp kế tiếp dành diện tích chính cho lời giải đầy đủ, câu hỏi rút gọn và lựa chọn đã chọn vẫn xem lại được. Không ép cả stem, bốn đáp án và đoạn giải thích dài vào cùng một màn; không tự tiến sang câu khác.
- **Nhân vật và tài nguyên 3D:** chưa có mô hình nhân vật/mê cung dựng sẵn. Tạo cùng một nhân vật cách điệu và rig chuyển động đơn giản dùng lại ở cảnh 3/7; dây là mesh có độ dày; cảnh 5 là mô hình cách điệu. Ảnh CPV và video chỉ làm reference, không tự trở thành mô hình 3D có thể xoay.
- **Video tham khảo:** đã phát hiện `Tim - The History of Connection - MONOGRID.mp4` trong CPV, khoảng 32 MB; chưa kiểm tra nội dung chuyển động. Cần xem trước khi quyết định nhịp camera và chuyển cảnh. Không nhúng mặc định video tham khảo vào bài. Môi trường hiện có Python và Node, chưa tìm thấy ffmpeg/ffprobe trong PATH hoặc thư viện video Python kiểm tra; đây là việc chuẩn bị công cụ của người xây dựng, không phải yêu cầu người dùng cài để mở HTML.
- **Phạm vi editor:** chỉnh text, ảnh và tham số camera/parallax đã nêu; không bao gồm sửa từng đỉnh mesh hoặc từng xương nhân vật. Ảnh thay thế và xóa nền áp dụng cho đối tượng ảnh, không tự biến ảnh mới thành mô hình 3D. Tham số chung của cảnh 3D lưu trong dữ liệu và xuất lại được. Không có đối tượng phù hợp thì control disable rõ ràng. Nội dung quiz/notes/nhóm có trường chỉnh sửa dữ liệu tương ứng để export không bị lệch lời giải và đáp án.
- **Vận hành khi trình chiếu:** hỗ trợ PageUp/PageDown cho bút; keyboard focus không làm Submit bị hiểu là chuyển cảnh. Nhấn tiến trong chuyển động hoàn tất nhịp hiện tại trước, không âm thầm bỏ qua lập luận. Notes và khán giả dùng cùng trạng thái, có nút điều khiển trong notes; tránh hai timer độc lập. Fullscreen và vị trí hai cửa sổ cần thao tác người dùng, không hứa tự đặt đúng màn hình trên mọi máy.
- **Hiệu năng và offline:** nhúng runtime, hình và âm thanh tạo tại chỗ; cài công cụ phát triển nếu cần không làm phát sinh phụ thuộc khi trình chiếu. Mục tiêu thiết kế 30 fps ổn định trên máy được kiểm tra, có thể lên 60 fps; chưa tuyên bố đạt. Giới hạn mật độ điểm ảnh, chất lượng bóng và số vật thể theo hiệu năng, giữ nhân vật và phân lớp dây. Đặt giới hạn dung lượng mục tiêu khoảng 15 MB cho bản mặc định; đo thực tế, tối ưu trước khi thêm tài nguyên nặng. File export có ảnh người dùng thay có thể lớn hơn. Kiểm tra file://, notes riêng và export round-trip sớm trong giai đoạn triển khai.

### Các điểm đã chốt, không cần hỏi lại

Tên duy nhất REFORMING VIETNAM’S POLITICAL SYSTEM; 15 cảnh; nội dung tiếng Anh và editor tiếng Việt; offline một HTML; không xuất bản Sites; cảnh 3 khoảng 2 phút 20 giây; nhân vật xuyên cảnh 3/7; dây đỏ → xanh lá, cyan cho kênh số; cảnh 63 → 34 cách điệu; bốn quiz D–A–C–B và giơ tay; cảnh 15 chỉ lời cảm ơn không quốc kỳ; không có cảnh nguồn hoặc thảo luận mở riêng. Đã có danh sách bốn thành viên và nhãn Topic 6; phân công để điền sau. Bản HTML hiện có chưa được sửa trong quá trình lập kế hoạch.

### Đầu vào cập nhật từ người dùng

- **Thời lượng:** người dùng chưa biết giới hạn của giảng viên. Giữ dự toán 11 phút nói cộng 4–6 phút quiz để thiết kế; không coi là giới hạn chính thức.
- **Chủ đề:** Topic 6.
- **Thành viên:** Phạm Tiến Mạnh; Nguyễn Tuấn Hưng; Peeters Hải Nam; Nguyễn Quang Huy. Giữ nguyên dấu tiếng Việt và cách viết tên.
- **Người nói:** danh sách bốn tên chưa đủ để tự khẳng định cả bốn đều nói hoặc tự gán phần việc đã hoàn thành.
- **Máy trình chiếu/Extend:** chưa có câu trả lời; câu hỏi trước vẫn còn mở.
- Việc bổ sung thông tin này không phải lệnh bắt đầu tạo HTML.
