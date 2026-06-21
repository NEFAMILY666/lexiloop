const featuredWords = [
  { id:'system-achieve', term:'achieve', definition:'達成；實現', example:'She worked hard to achieve her goal.', part_of_speech:'verb', level:'A2' },
  { id:'system-adapt', term:'adapt', definition:'適應；調整', example:'It takes time to adapt to a new environment.', part_of_speech:'verb', level:'B1' },
  { id:'system-advantage', term:'advantage', definition:'優勢；有利條件', example:'Speaking two languages is a great advantage.', part_of_speech:'noun', level:'A2' },
  { id:'system-aware', term:'aware', definition:'知道的；意識到的', example:'Are you aware of the new rule?', part_of_speech:'adjective', level:'B1' },
  { id:'system-benefit', term:'benefit', definition:'益處；使受益', example:'Regular exercise benefits both body and mind.', part_of_speech:'noun', level:'B1' },
  { id:'system-challenge', term:'challenge', definition:'挑戰；難題', example:'Learning a language is an exciting challenge.', part_of_speech:'noun', level:'A2' },
  { id:'system-communicate', term:'communicate', definition:'溝通；傳達', example:'Good teams communicate clearly.', part_of_speech:'verb', level:'A2' },
  { id:'system-confident', term:'confident', definition:'有自信的', example:'He feels confident about the presentation.', part_of_speech:'adjective', level:'B1' },
  { id:'system-consider', term:'consider', definition:'考慮；認為', example:'Please consider all the options carefully.', part_of_speech:'verb', level:'B1' },
  { id:'system-convenient', term:'convenient', definition:'方便的；便利的', example:'Online shopping is convenient for busy people.', part_of_speech:'adjective', level:'B1' },
  { id:'system-curious', term:'curious', definition:'好奇的', example:'The child was curious about how it worked.', part_of_speech:'adjective', level:'A2' },
  { id:'system-decision', term:'decision', definition:'決定；決策', example:'It was a difficult decision to make.', part_of_speech:'noun', level:'A2' },
  { id:'system-depend', term:'depend', definition:'依靠；取決於', example:'The result will depend on your preparation.', part_of_speech:'verb', level:'A2' },
  { id:'system-efficient', term:'efficient', definition:'有效率的', example:'This is a more efficient way to work.', part_of_speech:'adjective', level:'B2' },
  { id:'system-effort', term:'effort', definition:'努力；心力', example:'Your progress is worth the effort.', part_of_speech:'noun', level:'A2' },
  { id:'system-essential', term:'essential', definition:'必要的；不可或缺的', example:'Water is essential for life.', part_of_speech:'adjective', level:'B1' },
  { id:'system-experience', term:'experience', definition:'經驗；經歷', example:'Traveling abroad was an unforgettable experience.', part_of_speech:'noun', level:'A2' },
  { id:'system-familiar', term:'familiar', definition:'熟悉的', example:'Her voice sounds familiar to me.', part_of_speech:'adjective', level:'B1' },
  { id:'system-flexible', term:'flexible', definition:'有彈性的；靈活的', example:'My work schedule is quite flexible.', part_of_speech:'adjective', level:'B2' },
  { id:'system-focus', term:'focus', definition:'專注；焦點', example:'Try to focus on one task at a time.', part_of_speech:'verb', level:'A2' },
  { id:'system-improve', term:'improve', definition:'改善；進步', example:'Reading every day will improve your vocabulary.', part_of_speech:'verb', level:'A2' },
  { id:'system-influence', term:'influence', definition:'影響；影響力', example:'Friends can influence the choices we make.', part_of_speech:'verb', level:'B1' },
  { id:'system-opportunity', term:'opportunity', definition:'機會', example:'This job is a great opportunity to learn.', part_of_speech:'noun', level:'B1' },
  { id:'system-prefer', term:'prefer', definition:'較喜歡；偏好', example:'I prefer tea to coffee in the morning.', part_of_speech:'verb', level:'A2' },
  { id:'system-recommend', term:'recommend', definition:'推薦；建議', example:'I recommend visiting the museum early.', part_of_speech:'verb', level:'B1' },
  { id:'system-reliable', term:'reliable', definition:'可靠的；可信賴的', example:'We need a reliable source of information.', part_of_speech:'adjective', level:'B2' },
  { id:'system-require', term:'require', definition:'需要；要求', example:'This task requires careful planning.', part_of_speech:'verb', level:'B1' },
  { id:'system-solution', term:'solution', definition:'解決方法；答案', example:'We finally found a solution to the problem.', part_of_speech:'noun', level:'A2' },
  { id:'system-specific', term:'specific', definition:'明確的；特定的', example:'Could you give me a specific example?', part_of_speech:'adjective', level:'B1' },
  { id:'system-suggest', term:'suggest', definition:'建議；暗示', example:'I suggest taking a short break.', part_of_speech:'verb', level:'A2' },
  { id:'system-support', term:'support', definition:'支持；支援', example:'Her family supported her decision.', part_of_speech:'verb', level:'A2' },
  { id:'system-valuable', term:'valuable', definition:'有價值的；寶貴的', example:'The course gave me valuable experience.', part_of_speech:'adjective', level:'B1' },
];

const coreWordData = `
accept|接受|verb|A2;accident|意外事故|noun|A2;active|活躍的|adjective|A2;activity|活動|noun|A2;advice|建議|noun|A2;afford|負擔得起|verb|A2;agree|同意|verb|A2;allow|允許|verb|A2;alone|獨自的|adjective|A2;amazing|令人驚奇的|adjective|A2
arrive|抵達|verb|A2;attend|參加；出席|verb|A2;available|可取得的；有空的|adjective|A2;avoid|避免|verb|A2;basic|基本的|adjective|A2;believe|相信|verb|A2;belong|屬於|verb|A2;borrow|借入|verb|A2;bright|明亮的；聰明的|adjective|A2;cancel|取消|verb|A2
careful|小心的|adjective|A2;carry|攜帶|verb|A2;cause|造成；原因|verb|A2;celebrate|慶祝|verb|A2;choice|選擇|noun|A2;collect|收集|verb|A2;common|常見的|adjective|A2;compare|比較|verb|A2;complete|完成；完整的|verb|A2;continue|繼續|verb|A2
create|創造|verb|A2;daily|每日的|adjective|A2;dangerous|危險的|adjective|A2;develop|發展|verb|A2;difference|差異|noun|A2;direction|方向；指示|noun|A2;discover|發現|verb|A2;education|教育|noun|A2;enough|足夠的|adjective|A2;environment|環境|noun|A2
event|事件；活動|noun|A2;explain|解釋|verb|A2;fact|事實|noun|A2;famous|著名的|adjective|A2;foreign|外國的|adjective|A2;future|未來|noun|A2;general|一般的|adjective|A2;happen|發生|verb|A2;healthy|健康的|adjective|A2;helpful|有幫助的|adjective|A2
imagine|想像|verb|A2;important|重要的|adjective|A2;information|資訊|noun|A2;invite|邀請|verb|A2;journey|旅程|noun|A2;language|語言|noun|A2;local|當地的|adjective|A2;manage|設法做到；管理|verb|A2;meaning|意思；意義|noun|A2;memory|記憶|noun|A2
message|訊息|noun|A2;mistake|錯誤|noun|A2;modern|現代的|adjective|A2;nature|大自然；本質|noun|A2;necessary|必要的|adjective|A2;normal|正常的|adjective|A2;notice|注意到；通知|verb|A2;offer|提供|verb|A2;organize|組織；整理|verb|A2;possible|可能的|adjective|A2
practice|練習|noun|A2;prepare|準備|verb|A2;promise|承諾|verb|A2;protect|保護|verb|A2;reason|理由|noun|A2;receive|收到|verb|A2;remember|記得|verb|A2;repeat|重複|verb|A2;return|返回；歸還|verb|A2;safe|安全的|adjective|A2
serious|嚴重的；認真的|adjective|A2;share|分享|verb|A2;simple|簡單的|adjective|A2;special|特別的|adjective|A2;spend|花費|verb|A2;strange|奇怪的|adjective|A2;succeed|成功|verb|A2;useful|有用的|adjective|A2;visit|參觀；拜訪|verb|A2;worry|擔心|verb|A2
abroad|在國外|adverb|A2;adult|成年人|noun|A2;adventure|冒險|noun|A2;appointment|約會；預約|noun|A2;article|文章|noun|A2;audience|觀眾|noun|A2;comfortable|舒適的|adjective|A2;conversation|對話|noun|A2;delicious|美味的|adjective|A2;describe|描述|verb|A2
account|帳戶；敘述|noun|B1;affect|影響|verb|B1;amount|數量|noun|B1;apologize|道歉|verb|B1;appear|出現；似乎|verb|B1;apply|申請；應用|verb|B1;argue|爭論|verb|B1;arrange|安排|verb|B1;attitude|態度|noun|B1;average|平均的|adjective|B1
behavior|行為|noun|B1;career|職業生涯|noun|B1;certain|確定的；某個|adjective|B1;chance|機會；可能性|noun|B1;character|個性；角色|noun|B1;community|社群|noun|B1;complain|抱怨|verb|B1;concern|擔憂；關係到|noun|B1;condition|狀況；條件|noun|B1;connect|連接|verb|B1
contain|包含|verb|B1;contribute|貢獻|verb|B1;culture|文化|noun|B1;customer|顧客|noun|B1;deal|處理；交易|verb|B1;demand|要求；需求|noun|B1;detail|細節|noun|B1;encourage|鼓勵|verb|B1;energy|能量；精力|noun|B1;entire|整個的|adjective|B1
exist|存在|verb|B1;expect|預期|verb|B1;express|表達|verb|B1;fail|失敗|verb|B1;feature|特色；特徵|noun|B1;goal|目標|noun|B1;habit|習慣|noun|B1;identify|辨認；確認|verb|B1;increase|增加|verb|B1;independent|獨立的|adjective|B1
individual|個人；個別的|noun|B1;industry|產業|noun|B1;insist|堅持|verb|B1;instead|反而；代替|adverb|B1;introduce|介紹；引進|verb|B1;knowledge|知識|noun|B1;likely|可能的|adjective|B1;material|材料；資料|noun|B1;mention|提到|verb|B1;method|方法|noun|B1
observe|觀察；遵守|verb|B1;opinion|意見|noun|B1;ordinary|普通的|adjective|B1;patient|有耐心的；病人|adjective|B1;perform|表演；執行|verb|B1;personal|個人的|adjective|B1;population|人口|noun|B1;position|位置；職位|noun|B1;prevent|預防；阻止|verb|B1;probably|大概；很可能|adverb|B1
produce|生產|verb|B1;provide|提供|verb|B1;public|公共的|adjective|B1;purpose|目的|noun|B1;quality|品質|noun|B1;realize|意識到；實現|verb|B1;reduce|減少|verb|B1;relationship|關係|noun|B1;remain|保持；留下|verb|B1;replace|取代|verb|B1
respond|回應|verb|B1;result|結果|noun|B1;risk|風險|noun|B1;role|角色；作用|noun|B1;schedule|行程；排程|noun|B1;situation|情況|noun|B1;skill|技能|noun|B1;social|社會的；社交的|adjective|B1;standard|標準|noun|B1;statement|陳述；聲明|noun|B1
strength|力量；優點|noun|B1;successful|成功的|adjective|B1;suitable|合適的|adjective|B1;task|任務|noun|B1;tradition|傳統|noun|B1;trust|信任|noun|B1;typical|典型的|adjective|B1;value|價值|noun|B1;variety|多樣性；種類|noun|B1;waste|浪費；廢物|noun|B1
wonder|想知道；驚奇|verb|B1;access|使用權；進入|noun|B1;addition|增加；附加物|noun|B1;advance|進步；前進|noun|B1;advertise|做廣告|verb|B1;although|雖然|conjunction|B1;attract|吸引|verb|B1;contact|聯絡|verb|B1;crowded|擁擠的|adjective|B1;distance|距離|noun|B1
accurate|準確的|adjective|B2;acquire|取得；習得|verb|B2;alternative|替代方案|noun|B2;analyze|分析|verb|B2;approach|方法；接近|noun|B2;appropriate|適當的|adjective|B2;assume|假設；認為|verb|B2;attempt|嘗試|noun|B2;balance|平衡|noun|B2;capable|有能力的|adjective|B2
circumstance|情況；環境|noun|B2;complex|複雜的|adjective|B2;concentrate|專心；集中|verb|B2;consequence|後果|noun|B2;constant|持續的；不變的|adjective|B2;consume|消耗；食用|verb|B2;convince|說服|verb|B2;creative|有創意的|adjective|B2;critical|關鍵的；批判的|adjective|B2;determine|決定；判定|verb|B2
effective|有效的|adjective|B2;emphasize|強調|verb|B2;enable|使能夠|verb|B2;establish|建立|verb|B2;evaluate|評估|verb|B2;evidence|證據|noun|B2;expand|擴展|verb|B2;factor|因素|noun|B2;financial|財務的|adjective|B2;function|功能；運作|noun|B2
generate|產生|verb|B2;impact|影響；衝擊|noun|B2;indicate|顯示；指出|verb|B2;maintain|維持；保養|verb|B2;measure|測量；措施|verb|B2;obtain|獲得|verb|B2;obvious|明顯的|adjective|B2;occur|發生|verb|B2;participate|參與|verb|B2;perspective|觀點；角度|noun|B2
potential|潛力；潛在的|noun|B2;practical|實用的；實際的|adjective|B2;principle|原則|noun|B2;priority|優先事項|noun|B2;professional|專業的|adjective|B2;promote|促進；推廣|verb|B2;recognize|認出；承認|verb|B2;recover|恢復|verb|B2;relevant|相關的|adjective|B2;represent|代表|verb|B2
resource|資源|noun|B2;responsibility|責任|noun|B2;significant|重要的；顯著的|adjective|B2;similar|相似的|adjective|B2;strategy|策略|noun|B2;structure|結構|noun|B2;struggle|掙扎；奮鬥|verb|B2;sufficient|足夠的|adjective|B2;target|目標|noun|B2;tendency|傾向|noun|B2
therefore|因此|adverb|B2;transform|轉變|verb|B2;transport|運輸|noun|B2;treatment|治療；對待|noun|B2;unique|獨特的|adjective|B2;vary|變化；不同|verb|B2;abstract|抽象的|adjective|B2;acknowledge|承認；確認|verb|B2;adequate|足夠的；適當的|adjective|B2;apparent|顯而易見的|adjective|B2
aspect|層面|noun|B2;assess|評估|verb|B2;authority|權威；職權|noun|B2;capacity|容量；能力|noun|B2;category|類別|noun|B2;commitment|承諾；投入|noun|B2;communication|溝通|noun|B2;competitive|有競爭力的|adjective|B2;concept|概念|noun|B2;conduct|進行；行為|verb|B2
consistent|一致的；持續的|adjective|B2;context|上下文；背景|noun|B2;contrast|對比|noun|B2;cooperate|合作|verb|B2;decline|下降；拒絕|verb|B2;define|定義|verb|B2;demonstrate|證明；展示|verb|B2;distribute|分配；散布|verb|B2;diverse|多元的|adjective|B2;domestic|國內的；家庭的|adjective|B2
emerge|出現；浮現|verb|B2;engage|參與；吸引|verb|B2;ensure|確保|verb|B2;estimate|估計|verb|B2;exception|例外|noun|B2;interpret|解釋；口譯|verb|B2;investigate|調查|verb|B2;objective|目標；客觀的|noun|B2;overall|整體的|adjective|B2;preserve|保存；保護|verb|B2
`;

const existingTerms=new Set(featuredWords.map(word=>word.term.toLowerCase()));
const coreWords=coreWordData.trim().split(/[;\n]+/).map(row=>row.trim()).filter(Boolean).map((row,index)=>{
  const [term,definition,part_of_speech,level]=row.split('|');
  return {id:'system-core-'+(index+1),term,definition,example:'',part_of_speech,level};
}).filter(word=>!existingTerms.has(word.term.toLowerCase())).slice(0,300-featuredWords.length);

export const systemWords=[...featuredWords,...coreWords];
