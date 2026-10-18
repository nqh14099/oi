/** Scene 1 / beat 0 only. GPU sculpture; the shared engine owns all resources and RAF.
 * Emblem contours derived from the referenced SVG, never invented from text.
 * Original: Eureka287, Lasse Havelund; current SVG revision Sshu94.
 * https://commons.wikimedia.org/wiki/File:Flag_of_the_Communist_Party_of_Vietnam.svg
 * Emblem adaptation: CC BY-SA 3.0, https://creativecommons.org/licenses/by-sa/3.0/
 */
const EMBLEM_CONTOURS = [[[0.33253,0.56371],[0.33703,0.5711],[0.34168,0.57827],[0.34647,0.58523],[0.35141,0.59195],[0.35649,0.59845],[0.36169,0.60471],[0.36702,0.61072],[0.37247,0.61649],[0.37803,0.62201],[0.38371,0.62726],[0.38949,0.63226],[0.39536,0.637],[0.40133,0.64145],[0.40739,0.64563],[0.41353,0.64954],[0.41975,0.65315],[0.42605,0.65647],[0.4324,0.65951],[0.43882,0.66222],[0.44529,0.66465],[0.45181,0.66675],[0.45838,0.66853],[0.46498,0.66998],[0.47161,0.67108],[0.47826,0.67183],[0.48492,0.67221],[0.49159,0.67222],[0.49826,0.67184],[0.50491,0.67105],[0.51153,0.66987],[0.51811,0.66825],[0.52464,0.66622],[0.5311,0.66373],[0.53748,0.66081],[0.54376,0.65745],[0.54993,0.65365],[0.55598,0.64942],[0.56187,0.64474],[0.56761,0.63965],[0.57317,0.63411],[0.57852,0.62816],[0.58366,0.62178],[0.58856,0.61499],[0.5932,0.6078],[0.59755,0.60021],[0.60161,0.59228],[0.60537,0.58402],[0.60884,0.57547],[0.61201,0.56667],[0.61487,0.55764],[0.61743,0.5484],[0.6197,0.539],[0.62167,0.52944],[0.62335,0.51975],[0.62474,0.50997],[0.62582,0.5001],[0.62663,0.49017],[0.62713,0.48019],[0.62737,0.47019],[0.62733,0.46019],[0.62703,0.45019],[0.62648,0.44022],[0.62568,0.43029],[0.62465,0.42041],[0.6234,0.41058],[0.62192,0.40082],[0.62024,0.39114],[0.61836,0.38154],[0.61628,0.37203],[0.61402,0.36262],[0.61158,0.35331],[0.60897,0.3441],[0.60619,0.33501],[0.60324,0.32603],[0.60013,0.31718],[0.59686,0.30847],[0.59343,0.29988],[0.58985,0.29144],[0.58611,0.28315],[0.58224,0.27501],[0.57822,0.26703],[0.57405,0.25921],[0.56975,0.25156],[0.56532,0.24409],[0.56075,0.2368],[0.55606,0.22968],[0.55124,0.22277],[0.5463,0.21605],[0.54124,0.20952],[0.53606,0.20321],[0.53078,0.19712],[0.52538,0.19123],[0.51988,0.18558],[0.51427,0.18016],[0.50927,0.1753],[0.5159,0.17631],[0.52251,0.17768],[0.52908,0.17937],[0.53561,0.18139],[0.5421,0.18373],[0.54853,0.18639],[0.5549,0.18937],[0.5612,0.19266],[0.56742,0.19625],[0.57356,0.20015],[0.57961,0.20436],[0.58557,0.20887],[0.59142,0.21366],[0.59716,0.21875],[0.60279,0.22412],[0.6083,0.22977],[0.61367,0.2357],[0.61891,0.24189],[0.624,0.24835],[0.62895,0.25507],[0.63374,0.26203],[0.63837,0.26922],[0.64285,0.27664],[0.64716,0.28428],[0.6513,0.29212],[0.65526,0.30016],[0.65905,0.3084],[0.66266,0.31682],[0.66607,0.32541],[0.6693,0.33417],[0.67233,0.34308],[0.67515,0.35214],[0.67778,0.36134],[0.6802,0.37066],[0.6824,0.3801],[0.68439,0.38965],[0.68617,0.3993],[0.68772,0.40903],[0.68906,0.41883],[0.69018,0.42869],[0.69109,0.4386],[0.69178,0.44855],[0.69225,0.45853],[0.69251,0.46853],[0.69254,0.47853],[0.69235,0.48854],[0.69194,0.49852],[0.69131,0.50848],[0.69046,0.5184],[0.68938,0.52828],[0.68809,0.53809],[0.68657,0.54783],[0.68484,0.55749],[0.68289,0.56706],[0.68072,0.57652],[0.67835,0.58587],[0.67577,0.5951],[0.67299,0.6042],[0.67001,0.61315],[0.66684,0.62195],[0.66348,0.6306],[0.65994,0.63907],[0.65621,0.64736],[0.65229,0.65546],[0.64819,0.66336],[0.64393,0.67104],[0.63949,0.67851],[0.63489,0.68576],[0.63012,0.69276],[0.6252,0.6995],[0.62012,0.70599],[0.6149,0.71222],[0.60954,0.71817],[0.60405,0.72386],[0.59844,0.72927],[0.59272,0.73441],[0.58688,0.73926],[0.58094,0.74382],[0.57491,0.74809],[0.56879,0.75206],[0.56259,0.75574],[0.55631,0.75911],[0.54996,0.76218],[0.54355,0.76493],[0.53708,0.76737],[0.53056,0.76949],[0.524,0.77128],[0.5174,0.77274],[0.51077,0.77388],[0.50412,0.77467],[0.49746,0.77513],[0.49079,0.77524],[0.48412,0.775],[0.47747,0.77441],[0.47083,0.77348],[0.46421,0.77221],[0.45763,0.7706],[0.45108,0.76866],[0.44459,0.7664],[0.43814,0.76381],[0.43176,0.76092],[0.42544,0.7577],[0.4192,0.75419],[0.41303,0.75037],[0.40695,0.74625],[0.40096,0.74185],[0.39508,0.73714],[0.38929,0.73217],[0.38362,0.7269],[0.37806,0.72136],[0.37263,0.71556],[0.36734,0.70948],[0.36217,0.70314],[0.35715,0.69655],[0.35229,0.6897],[0.34759,0.68261],[0.34305,0.67528],[0.33839,0.67915],[0.33367,0.68623],[0.32896,0.6933],[0.32424,0.70038],[0.31952,0.70745],[0.31481,0.71453],[0.31009,0.7216],[0.30537,0.72868],[0.30066,0.73575],[0.29594,0.74283],[0.29122,0.7499],[0.28651,0.75698],[0.28179,0.76405],[0.27707,0.76889],[0.27236,0.76181],[0.26764,0.75474],[0.26292,0.74766],[0.25821,0.74059],[0.25349,0.73351],[0.24877,0.72644],[0.24406,0.71936],[0.23934,0.71229],[0.2382,0.70521],[0.24292,0.69814],[0.24763,0.69106],[0.25235,0.68399],[0.25707,0.67691],[0.26178,0.66984],[0.2665,0.66276],[0.27122,0.65569],[0.27593,0.64861],[0.28065,0.64154],[0.28537,0.63446],[0.29008,0.62739],[0.2948,0.62031],[0.29952,0.61324],[0.30423,0.60616],[0.30895,0.59909],[0.31367,0.59201],[0.31838,0.58494],[0.3231,0.57786],[0.32782,0.57079],[0.33253,0.56371]],[[0.52573,0.29609],[0.52258,0.30081],[0.51944,0.30552],[0.5163,0.31024],[0.51315,0.31495],[0.51001,0.31966],[0.50687,0.32438],[0.50373,0.32909],[0.50058,0.33381],[0.49744,0.33852],[0.49429,0.34324],[0.49115,0.34795],[0.48801,0.35267],[0.48487,0.35738],[0.48172,0.3621],[0.47858,0.36681],[0.47928,0.37153],[0.48242,0.37624],[0.48556,0.38096],[0.4887,0.38567],[0.49185,0.39039],[0.49499,0.3951],[0.49813,0.39981],[0.50128,0.40453],[0.50442,0.40924],[0.50756,0.41396],[0.51071,0.41867],[0.51385,0.42339],[0.51699,0.4281],[0.52014,0.43282],[0.52328,0.43753],[0.52642,0.44225],[0.52956,0.44696],[0.53271,0.45168],[0.53585,0.45639],[0.53899,0.46111],[0.54214,0.46582],[0.54528,0.47054],[0.54842,0.47525],[0.55157,0.47996],[0.55471,0.48468],[0.55785,0.48939],[0.561,0.49411],[0.56414,0.49882],[0.56728,0.50354],[0.57043,0.50825],[0.57357,0.51297],[0.57671,0.51768],[0.57985,0.5224],[0.583,0.52711],[0.58614,0.53183],[0.58928,0.53654],[0.59243,0.54126],[0.59557,0.54597],[0.59871,0.55068],[0.60186,0.5554],[0.605,0.56011],[0.60814,0.56483],[0.61129,0.56954],[0.61443,0.57426],[0.61757,0.57897],[0.62072,0.58369],[0.62386,0.5884],[0.627,0.59312],[0.63015,0.59783],[0.63329,0.60255],[0.63643,0.60726],[0.63957,0.61198],[0.64272,0.61669],[0.64586,0.62141],[0.649,0.62612],[0.65215,0.63083],[0.65529,0.63555],[0.65843,0.64026],[0.66158,0.64498],[0.66472,0.64969],[0.66786,0.65441],[0.67101,0.65912],[0.67415,0.66384],[0.67729,0.66855],[0.68043,0.67327],[0.68358,0.67798],[0.68672,0.6827],[0.68987,0.68741],[0.69301,0.69213],[0.69342,0.69685],[0.69029,0.70159],[0.68717,0.70633],[0.68404,0.71106],[0.68091,0.7158],[0.67778,0.72054],[0.67466,0.72528],[0.67153,0.73002],[0.6684,0.73475],[0.66527,0.73949],[0.66215,0.74423],[0.65902,0.74897],[0.65589,0.7537],[0.65276,0.75844],[0.64964,0.76318],[0.64651,0.76792],[0.64337,0.76578],[0.64023,0.76106],[0.63708,0.75635],[0.63394,0.75163],[0.6308,0.74692],[0.62765,0.74221],[0.62451,0.73749],[0.62137,0.73278],[0.61822,0.72806],[0.61508,0.72335],[0.61194,0.71863],[0.6088,0.71392],[0.60565,0.7092],[0.60251,0.70449],[0.59936,0.69977],[0.59622,0.69506],[0.59308,0.69034],[0.58994,0.68563],[0.58679,0.68091],[0.58365,0.6762],[0.58051,0.67148],[0.57736,0.66677],[0.57422,0.66206],[0.57108,0.65734],[0.56793,0.65263],[0.56479,0.64791],[0.56165,0.6432],[0.55851,0.63848],[0.55536,0.63377],[0.55222,0.62905],[0.54908,0.62434],[0.54593,0.61962],[0.54279,0.61491],[0.53965,0.61019],[0.5365,0.60548],[0.53336,0.60076],[0.53022,0.59605],[0.52707,0.59133],[0.52393,0.58662],[0.52079,0.58191],[0.51765,0.57719],[0.5145,0.57248],[0.51136,0.56776],[0.50821,0.56305],[0.50507,0.55833],[0.50193,0.55362],[0.49879,0.5489],[0.49564,0.54419],[0.4925,0.53947],[0.48936,0.53476],[0.48621,0.53004],[0.48307,0.52533],[0.47993,0.52061],[0.47678,0.5159],[0.47364,0.51118],[0.4705,0.50647],[0.46735,0.50176],[0.46421,0.49704],[0.46107,0.49233],[0.45793,0.48761],[0.45478,0.4829],[0.45164,0.47818],[0.44849,0.47347],[0.44535,0.46875],[0.44221,0.46404],[0.43907,0.45932],[0.43592,0.45461],[0.43278,0.44989],[0.42964,0.44518],[0.42649,0.44494],[0.42335,0.44966],[0.42021,0.45437],[0.41706,0.45909],[0.41392,0.4638],[0.41078,0.46852],[0.40763,0.47323],[0.40449,0.47795],[0.40135,0.48266],[0.39821,0.48738],[0.39506,0.49209],[0.39192,0.49681],[0.38878,0.49848],[0.38563,0.49376],[0.38249,0.48905],[0.37935,0.48434],[0.3762,0.47962],[0.37306,0.47491],[0.36992,0.47019],[0.36678,0.46548],[0.36363,0.46076],[0.36049,0.45605],[0.35734,0.45133],[0.3542,0.44662],[0.35106,0.4419],[0.34792,0.43719],[0.34477,0.43247],[0.34163,0.42776],[0.33849,0.42304],[0.33534,0.41833],[0.33447,0.41361],[0.33762,0.4089],[0.34076,0.40418],[0.3439,0.39947],[0.34705,0.39476],[0.35019,0.39004],[0.35333,0.38533],[0.35648,0.38061],[0.35962,0.3759],[0.36276,0.37118],[0.3659,0.36647],[0.36905,0.36175],[0.37219,0.35704],[0.37533,0.35232],[0.37848,0.34761],[0.38162,0.34289],[0.38476,0.33818],[0.38791,0.33346],[0.39105,0.32875],[0.39419,0.32404],[0.39734,0.31932],[0.40048,0.31461],[0.40362,0.30989],[0.40677,0.30518],[0.40991,0.30046],[0.41305,0.29575],[0.4162,0.29103],[0.41934,0.28632],[0.42248,0.2816],[0.42562,0.27689],[0.42885,0.27254],[0.43329,0.27308],[0.43773,0.27338],[0.44217,0.27343],[0.44661,0.27323],[0.45105,0.27279],[0.45547,0.2721],[0.45987,0.27117],[0.46424,0.26999],[0.46859,0.26857],[0.47289,0.26691],[0.47715,0.26501],[0.48136,0.26287],[0.48552,0.26051],[0.48961,0.25792],[0.49364,0.2551],[0.49744,0.25366],[0.50058,0.25837],[0.50373,0.26309],[0.50687,0.2678],[0.51001,0.27252],[0.51315,0.27723],[0.5163,0.28195],[0.51944,0.28666],[0.52258,0.29138],[0.52573,0.29609]]];
const EMBLEM_PATHS = ["m -6436.471547371615,1742.926950096642 c 6.38779271804,7.230641357446 14.963163305737,12.502793149194 24.298667889062,14.938860558647 6.056211101325,1.5803471957 12.472708435771,1.978650572228 18.596462444365,0.684499497231 6.123754008594,-1.294151074997 11.937748010956,-4.335579482059 16.158102214692,-8.957678632632 4.574893298958,-5.010387614465 7.112965317221,-11.701447693132 7.640977625143,-18.465679781602 0.528012307931,-6.76423208847 -0.871424851367,-13.593465851735 -3.428046439768,-19.878155088105 -4.560331599745,-11.210210791164 -12.883741385267,-20.851111282196 -23.308680635365,-26.998150562502 8.512796781266,0.709574410866 16.805946699762,3.8827694509 23.618107102883,9.036959544979 6.812160403116,5.154190094079 12.120611342006,12.272184963572 15.117966521428,20.271376598489 2.997355179421,7.999191634919 3.673617806543,16.852901094338 1.925932041966,25.214527691603 -1.747685764577,8.361626597266 -5.913491031185,16.203282596691 -11.863819649182,22.332295096395 -8.683007967653,8.943752149713 -21.180068232394,14.055514292711 -33.64194922505,13.760807647735 -12.461880992656,-0.294706644979 -24.703333498127,-5.991501184333 -32.953855939355,-15.335708444904 l -14.556480332948,14.556690177998 -9.381909223252,-9.381909223192 z","m -6392.699744590418,1702.503831581282 -10.959354263905,10.959354263781 49.262553323164,49.262553323191 -11.130862671953,11.240941835746 -49.317592904992,-49.317592905071 -8.654444010462,8.654444010525 -12.790755991701,-12.790755991717 21.572665110517,-21.572665110577 c 2.680889538451,0.275819129839 5.402702461607,0.150469066643 8.046892630834,-0.370590679184 2.581477478967,-0.508701686704 5.088366413035,-1.394314604689 7.416535436053,-2.62005208911 z"];

const clamp = v => Math.max(0, Math.min(1, v));
const ease = (a,b,t) => {const v=clamp((t-a)/(b-a));return v*v*(3-2*v);};
export function emblemContains(u,v) {
  return EMBLEM_CONTOURS.some(poly=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const [x,y]=poly[i],[px,py]=poly[j];if((y>v)!==(py>v)&&u<(px-x)*(v-y)/(py-y)+x)inside=!inside;
  }return inside;});
}
export function flagSamples(count=22000) {
  let seed=68319;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const attributes=Object.fromEntries(['position','aTarget','aSize','aSeed','aDelay','aRegion','aBrightness'].map(k=>[k,[]]));
  for(let i=0;i<count;i++){
    const u=random(),v=random(),r=random(),gold=emblemContains(u,v);
    attributes.position.push((random()-.5)*.04,(random()-.5)*.04,(random()-.5)*.08);
    attributes.aTarget.push((u-.5)*4.38,(.5-v)*2.92,(random()-.5)*.15+(gold?.025:0));
    attributes.aSize.push(.95+random()**3*1.6+(gold?.45:0));attributes.aSeed.push(random());
    attributes.aDelay.push(Math.hypot(u-.5,v-.5)*.27+random()*.12);
    attributes.aRegion.push(gold?1:r>.988?2:0);
    attributes.aBrightness.push(r>.975?2.0:r>.8?1.3:.65+random()*.35);
  }
  return attributes;
}
const quadVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}`;
const atmosphereFragment=`uniform float uTime;uniform float uAspect;varying vec2 vUv;
float sm(float a,float b,float t){return smoothstep(a,b,t);}
float smin(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
void main(){
 float t=uTime,space=sm(1.04,1.4,t);vec2 p=(vUv-vec2(.5,.51))*vec2(uAspect,1.);
 float grow=sm(.75,1.2,t);float scale=mix(.046,.66,grow);vec2 q=p/scale;
 float bulb=length(q-vec2(0.,.30))-.43;
 float neck=max(abs(q.x)-.16,abs(q.y+.14)-.34);
 float shaft=max(abs(q.x)-(.24-.16*(q.y+.65)),abs(q.y+.62)-.23);
 float d=smin(smin(bulb,neck,.12),shaft,.10),blur=mix(.09,.34,grow);
 float shape=1.-smoothstep(-blur,blur,d);
 float halo=exp(-dot(q,q)*1.45);
 vec3 col=vec3(.0006,.001,.0028);
 col+=vec3(.0018,.008,.047)*(shape*.9+halo*.32)*sm(.08,.45,t)*(1.-sm(1.1,1.4,t));
 vec2 sky=(vUv-vec2(.64,.54))*vec2(uAspect,1.);
 col+=vec3(.003,.013,.060)*exp(-dot(sky,sky)*1.9)*space;
 float curve=.71-.78*vUv.x+.24*vUv.x*vUv.x;
 float band=exp(-pow((vUv.y-curve)/.03,2.))*exp(-pow((vUv.x-.30)/.27,2.));
 col+=vec3(.0005,.004,.024)*band*space;
 float travel=sm(1.35,2.4,t);vec2 core=mix(vec2(.62,.15),vec2(.68,.55),travel);
 float dist=length((vUv-core)*vec2(uAspect,1.));
 float strength=sm(1.32,1.48,t)*(1.-.96*sm(1.95,2.6,t));
 col+=vec3(1.8,1.15,.48)*exp(-pow(dist/.009,2.))*strength;
 col+=vec3(.042,.027,.016)*exp(-pow(dist/.09,2.))*strength;
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
const flagVertex=`attribute vec3 aTarget;attribute float aSize,aSeed,aDelay,aRegion,aBrightness;
uniform float uTime,uPixels;varying float vRegion,vAlpha,vBrightness;
void main(){float t=uTime;float f=clamp((t-1.48-aDelay)/.68,0.,1.);f=f*f*(3.-2.*f);
 vec3 p=mix(position,aTarget,f);float u=aTarget.x/4.38+.5,v=.5-aTarget.y/2.92;
 p.z+=f*.055*sin(u*7.-t*.55)*sin(3.14159*v);p.y+=f*.015*sin(u*5.-t*.4);
 float travel=smoothstep(1.35,2.4,t);p+=mix(vec3(1.45,-2.38,0.),vec3(2.18,.34,0.),travel);
 vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;
 gl_PointSize=clamp(aSize*uPixels*8.2/-view.z,.65,6.);
 vAlpha=smoothstep(1.48+aDelay,1.72+aDelay,t)*mix(.62,.98,aRegion==1.?1.:0.);
 vRegion=aRegion;vBrightness=aBrightness;
}`;
const pointFragment=`varying float vRegion,vAlpha,vBrightness;void main(){
 float r=length(gl_PointCoord-vec2(.5));float a=1.-smoothstep(.10,.5,r);if(a<.015)discard;
 vec3 color=vRegion<.5?vec3(.43,.035,.056):vRegion<1.5?vec3(.80,.57,.20):vec3(.58,.68,.77);
 gl_FragColor=vec4(color*vBrightness,a*vAlpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
const starVertex=`attribute float aSize,aBrightness;uniform float uTime,uPixels;varying float vAlpha;
void main(){vec3 p=position;p.x+=sin(position.y*1.3)*min(uTime,3.)*.006;
 vec4 view=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*view;gl_PointSize=clamp(aSize*uPixels*12./-view.z,.65,5.);
 vAlpha=aBrightness*mix(.018,.6,smoothstep(1.1,1.55,uTime));}`;
const starFragment=`varying float vAlpha;void main(){float r=length(gl_PointCoord-vec2(.5));float a=1.-smoothstep(.03,.5,r);gl_FragColor=vec4(.58,.68,.80,a*vAlpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export function createOpeningPrototype({record,document:doc,window:win,motion,portrait,now=()=>performance.now()}) {
  let group,flag,uniforms,ctx,active=false,running=false,settling=false,startTime=0,paused=0,hiddenAt=null,elapsed=0,abort=null,oldFar;
  const pointer={x:0,y:0,sx:0,sy:0};const lines=[];
  const still=()=>motion.matches||portrait.matches||ctx?.reducedMotion||ctx?.mode!=='webgl';
  const make=(tag,cls)=>{const node=doc.createElement(tag);node.className=cls;return node;};
  // SVG is a quiet information-preserving fallback, not the primary animation.
  const fallback=doc.createElementNS('http://www.w3.org/2000/svg','svg');
  fallback.setAttribute('class','intro-flag-fallback');fallback.setAttribute('viewBox','0 0 238.125 158.75');fallback.setAttribute('role','img');fallback.setAttribute('aria-label','Communist Party of Vietnam flag');
  const rect=doc.createElementNS('http://www.w3.org/2000/svg','rect');
  for(const [k,v] of Object.entries({width:238.125,height:158.75,fill:'#A92F42',opacity:'.45'}))rect.setAttribute(k,v);fallback.append(rect);
  const symbol=doc.createElementNS('http://www.w3.org/2000/svg','g');symbol.setAttribute('transform','matrix(1.050999146073623 0 0 1.050999146073624 6843.910519110474 -1742.325520193743)');symbol.setAttribute('fill','#E7C57C');
  for(const d of EMBLEM_PATHS){const path=doc.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);symbol.append(path);}fallback.append(symbol);
  record.section.append(fallback);
  function setup(context){
    if(!context?.THREE||group)return;const T=context.THREE;
    uniforms={uTime:{value:0},uPixels:{value:1},uAspect:{value:16/9}};
    group=new T.Group();group.name='Scene 1 particle-flag opening';group.visible=false;
    const own=context.own;
    const mat=(vertexShader,fragmentShader,transparent=true)=>own(new T.ShaderMaterial({uniforms,vertexShader,fragmentShader,transparent,depthWrite:false,depthTest:false,blending:transparent?T.AdditiveBlending:T.NormalBlending}));
    const backdrop=new T.Mesh(own(new T.PlaneGeometry(2,2)),mat(quadVertex,atmosphereFragment,false));backdrop.frustumCulled=false;backdrop.renderOrder=-100;group.add(backdrop);
    const attrs=flagSamples(),geometry=own(new T.BufferGeometry());
    for(const [name,values] of Object.entries(attrs))geometry.setAttribute(name,new T.Float32BufferAttribute(values,['position','aTarget'].includes(name)?3:1));
    flag=new T.Points(geometry,mat(flagVertex,pointFragment));flag.frustumCulled=false;flag.renderOrder=2;group.add(flag);
    const stars=own(new T.BufferGeometry()),positions=[],sizes=[],brightness=[];let seed=38973;
    const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<720;i++){positions.push((random()-.5)*28,(random()-.5)*17,-1-random()*13);sizes.push(.85+random()**4*1.8);brightness.push(.24+random()**5*.65);}
    for(const [name,values] of [['position',positions],['aSize',sizes],['aBrightness',brightness]])stars.setAttribute(name,new T.Float32BufferAttribute(values,name==='position'?3:1));
    const field=new T.Points(stars,mat(starVertex,starFragment));field.frustumCulled=false;field.renderOrder=0;group.add(field);context.root.add(group);
  }
  function paint(t){
    elapsed=t;record.section.dataset.introTime=t.toFixed(3);
    if(uniforms)uniforms.uTime.value=t;
    record.subtitle.style.opacity=String(ease(1.45,2.05,t));
    record.members.style.opacity=String(ease(1.95,2.5,t));
    for(const [i,line] of lines.entries()){const f=ease(1.60+i*.10,2.10+i*.10,t);line.style.transform=`translateY(${(1-f)*105}%)`;line.style.opacity=String(f);}
  }
  function settle(){if(!active)return;const changed=running||elapsed!==3;running=false;settling=false;if(changed){paint(3);ctx?.invalidate?.();}}
  function start(context){
    stop();ctx=context;active=true;setup(ctx);record.cancel?.();
    record.section.classList.toggle('intro-prototype',true);record.section.dataset.beat='0';
    record.section.dataset.renderer=ctx?.mode==='webgl'?'webgl':'fallback';
    record.depth&&(record.depth.visible=false);group&&(group.visible=true);
    record.body.hidden=true;record.subtitle.hidden=false;record.members.hidden=false;
    record.heading.textContent='';lines.length=0;
    // Canonical text is divided at word boundaries only; editable titles remain intact.
    const words=record.scene.beats[0].audience.heading.split(' ');
    const chunks=words.length===4?[words[0],words[1],words.slice(2).join(' ')]:[words.join(' ')];
    chunks.forEach((text,i)=>{const clip=make('span','intro-title-clip'),line=make('span','intro-title-line');line.textContent=text+(i<chunks.length-1?' ':'');clip.append(line);record.heading.append(clip);lines.push(line);});
    Object.assign(pointer,{x:0,y:0,sx:0,sy:0});startTime=now();paused=0;hiddenAt=doc.hidden?now():null;
    if(ctx?.camera){oldFar=ctx.camera.perspective.far;ctx.camera.perspective.far=80;ctx.camera.reset({position:[0,0,8.2],target:[0,0,0],fov:45});}
    running=!still();paint(running?0:3);settling=false;
    if(uniforms){uniforms.uPixels.value=(ctx.size?.height??900)/900*Math.min(win.devicePixelRatio??1,ctx.quality==='low'?1:2);uniforms.uAspect.value=(ctx.size?.width??1600)/(ctx.size?.height??900);flag.geometry.setDrawRange(0,ctx.quality==='low'?6000:22000);}
    abort=()=>stop();ctx?.signal?.addEventListener('abort',abort,{once:true});ctx?.invalidate?.();
  }
  function stop(){
    active=false;running=false;settling=false;
    if(abort)ctx?.signal?.removeEventListener('abort',abort);abort=null;
    if(group)group.visible=false;if(record.depth)record.depth.visible=true;
    record.section?.classList.toggle('intro-prototype',false);
    record.subtitle.style.opacity='';record.members.style.opacity='';
    if(ctx?.camera&&oldFar!==undefined){ctx.camera.perspective.far=oldFar;ctx.camera.perspective.updateProjectionMatrix();}oldFar=undefined;
  }
  function update(dt,context){
    if(!active)return;ctx=context;record.section.dataset.renderer=ctx.mode;
    if(still()){settle();return;}
    if(running&&!doc.hidden){const t=Math.min(3,Math.max(0,(now()-startTime-paused)/1000));paint(t);if(t===3)running=false;}
    if(uniforms){uniforms.uPixels.value=(ctx.size?.height??900)/900*Math.min(win.devicePixelRatio??1,ctx.quality==='low'?1:2);uniforms.uAspect.value=(ctx.size?.width??1600)/(ctx.size?.height??900);flag.geometry.setDrawRange(0,ctx.quality==='low'?6000:22000);}
    const blend=ease(1.5,2.5,elapsed),alpha=1-Math.exp(-6*Math.min(dt,.1));
    pointer.sx+=(pointer.x-pointer.sx)*alpha;pointer.sy+=(pointer.y-pointer.sy)*alpha;
    settling=Math.abs(pointer.x-pointer.sx)+Math.abs(pointer.y-pointer.sy)>.001;
    if(settling||running)ctx.camera?.reset({position:[Math.sin(pointer.sx*.0698)*8.2*blend,Math.sin(pointer.sy*.0436)*8.2*blend,8.2],target:[0,0,0],fov:45});
  }
  const move=event=>{
    if(!active||still()||doc.hidden||event.pointerType==='touch')return;
    const rect=record.section.getBoundingClientRect?.();if(!rect?.width||!rect.height)return;
    pointer.x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));pointer.y=Math.max(-1,Math.min(1,1-(event.clientY-rect.top)/rect.height*2));settling=true;ctx?.invalidate?.();
  };
  const leave=()=>{if(!active)return;pointer.x=0;pointer.y=0;settling=true;ctx?.invalidate?.();};
  const visibility=()=>{if(!active)return;if(doc.hidden){if(hiddenAt===null)hiddenAt=now();}else{if(hiddenAt!==null)paused+=now()-hiddenAt;hiddenAt=null;ctx?.invalidate?.();}};
  const changed=()=>{if(active&&still()){Object.assign(pointer,{x:0,y:0,sx:0,sy:0});ctx?.camera?.reset({position:[0,0,8.2],target:[0,0,0],fov:45});settle();}};
  doc.addEventListener('pointermove',move);doc.addEventListener('pointerleave',leave);doc.addEventListener('visibilitychange',visibility);
  motion.addEventListener('change',changed);portrait.addEventListener('change',changed);
  return Object.freeze({setup,start,stop,update,settle,get active(){return active;},get animated(){return active&&(running||settling);},
    fallback(){if(active){record.section.dataset.renderer='fallback';settle();}},
    destroy(){stop();doc.removeEventListener('pointermove',move);doc.removeEventListener('pointerleave',leave);doc.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',changed);portrait.removeEventListener('change',changed);fallback.remove();group=null;uniforms=null;flag=null;}
  });
}
