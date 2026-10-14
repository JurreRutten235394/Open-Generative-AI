import subprocess, math, sys
from PIL import Image, ImageDraw, ImageFont
W,H,FPS,DUR=1280,720,30,30
F="/usr/share/fonts/opentype/inter/"
def font(s,b=True): return ImageFont.truetype(F+("Inter-Bold.otf" if b else "Inter-Medium.otf"),s)
BG=(14,32,24); GRASS=(34,110,58); DIRT=(176,120,72); WHITE=(245,245,240); YEL=(255,206,64); RED=(232,72,64); GRN=(90,220,120); MUTE=(170,200,180)
def ease(t): t=max(0,min(1,t)); return t*t*(3-2*t)
def ctext(d,y,s,f,c=WHITE,a=1.0,x=W//2):
    w=d.textlength(s,font=f); col=tuple(int(BG[i]+(c[i]-BG[i])*a) for i in range(3))
    d.text((x-w/2,y),s,font=f,fill=col)
def header(d,s,t):
    ctext(d,40,s,font(52),YEL,ease(t*3))
def diamond(d,cx,cy,r,occupied=(),runner=None):
    d.polygon([(cx,cy-r*1.6),(cx+r*1.6,cy),(cx,cy+r*1.6),(cx-r*1.6,cy)],fill=GRASS)
    pts=[(cx,cy+r),(cx+r,cy),(cx,cy-r),(cx-r,cy)]  # home,1st,2nd,3rd
    d.line(pts+[pts[0]],fill=DIRT,width=10)
    for i,(x,y) in enumerate(pts):
        s=12; fill=YEL if i in occupied else WHITE
        d.rectangle([x-s,y-s,x+s,y+s],fill=fill)
    d.ellipse([cx-16,cy-16,cx+16,cy+16],fill=DIRT)
    if runner is not None:
        seg=int(runner)%4; f=runner-int(runner)
        a,b=pts[seg],pts[(seg+1)%4]; x=a[0]+(b[0]-a[0])*f; y=a[1]+(b[1]-a[1])*f
        d.ellipse([x-14,y-14,x+14,y+14],fill=RED,outline=WHITE,width=3)
    return pts
def dots(d,x,y,label,n,tot,col):
    d.text((x,y),label,font=font(34),fill=WHITE)
    for i in range(tot):
        cx=x+180+i*48; c=col if i<n else (60,80,70)
        d.ellipse([cx,y+4,cx+34,y+38],fill=c)
def caption(d,s,t):
    f=font(36,False); a=ease(t*3)
    w=d.textlength(s,font=f); d.rounded_rectangle([W/2-w/2-24,H-110,W/2+w/2+24,H-50],18,fill=(8,18,14))
    ctext(d,H-102,s,f,WHITE,a)

def scene(tt):
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    # progress bar
    d.rectangle([0,H-8,W*tt/DUR,H],fill=YEL)
    if tt<4:
        t=tt/4
        diamond(d,W//2,500,85,runner=(tt*1.2)%4 if tt>1 else None)
        ctext(d,120,"BASEBALL",font(110),WHITE,ease(t*3))
        ctext(d,250,"in 30 seconds",font(48,False),YEL,ease(t*3-0.5))
    elif tt<9:
        t=(tt-4)/5; header(d,"Two teams take turns",t)
        sw=int((tt-4)//2.5)%2
        for i,(name,col) in enumerate([("HOME",(80,150,255)),("AWAY",RED)]):
            x=W//2-300+i*600; role=("BATS" if (i==sw) else "FIELDS")
            d.rounded_rectangle([x-200,200,x+200,470],30,fill=col if role=="BATS" else (40,70,55))
            ctext(d,240,name,font(60),WHITE,1,x); ctext(d,340,role,font(72),YEL if role=="BATS" else MUTE,1,x)
        ctext(d,290,"<->",font(60),WHITE,1)
        caption(d,"Both teams get to bat — and both teams play defense",t)
    elif tt<17:
        t=(tt-9)/8; header(d,"Balls and strikes",t)
        # strike zone
        zx,zy,zw,zh=760,170,220,300
        d.rectangle([zx,zy,zx+zw,zy+zh],outline=WHITE,width=4)
        ctext(d,zy+zh+12,"strike zone",font(28,False),MUTE,1,zx+zw/2)
        # pitch sequence: (start time, in_zone, swing)
        seq=[(9.0,True),(10.0,False),(11.0,True),(12.0,False),(13.0,True)]
        strikes=balls=0; ball_pos=None
        for st,inz in seq:
            if tt>=st+0.8:
                if inz: strikes+=1
                else: balls+=1
            elif tt>=st:
                p=ease((tt-st)/0.8); tx=zx+zw/2 if inz else zx+zw+90; ty=zy+zh/2+(0 if inz else -60)
                x=250+(tx-250)*p; y=320+(ty-320)*p-math.sin(p*math.pi)*60
                ball_pos=(x,y,inz)
        if ball_pos:
            x,y,inz=ball_pos; d.ellipse([x-18,y-18,x+18,y+18],fill=WHITE,outline=RED,width=3)
        d.ellipse([220,290,280,350],fill=(80,150,255))  # pitcher
        d.text((205,360),"pitcher",font=font(26,False),fill=MUTE)
        dots(d,120,470,"BALLS",balls,4,GRN)
        dots(d,120,530,"STRIKES",min(strikes,3),3,RED)
        if strikes>=3:
            ctext(d,120,"STRIKE 3 — OUT!",font(54),RED,ease((tt-13.8)*4),zx+zw/2-380)
        if tt<14:
            caption(d,"In the zone (or a swing and miss) = STRIKE.  Outside = BALL",t*2)
        else:
            caption(d,"3 strikes = you're out.   4 balls = free walk to first base",(tt-14)/3)
    elif tt<22:
        t=(tt-17)/5; header(d,"3 outs and the teams switch",t)
        outs=min(3,int((tt-17)/1.1)+0)
        for i in range(3):
            x=W//2-210+i*150; on=i<outs
            d.ellipse([x,200,x+120,320],fill=RED if on else (60,80,70))
            ctext(d,235,"OUT" if on else "",font(34),WHITE,1,x+60)
        if outs>=3:
            a=ease((tt-20.3)*3)
            ctext(d,380,"SWITCH SIDES!",font(70),YEL,a)
            ctext(d,470,"batters become fielders, fielders become batters",font(32,False),WHITE,a)
        caption(d,"Score runs by circling the bases back to home plate",t*3) if outs<3 else None
        if outs<3: diamond(d,W//2,480,70,runner=((tt-17)*1.4)%4)
    elif tt<27:
        t=(tt-22)/5; header(d,"9 innings",t)
        n=min(9,int((tt-22)/0.4)+1)
        away=[0,1,0,0,2,0,1,0,0]; home=[1,0,0,3,0,0,0,1,0]
        x0,y0,cw=200,190,80
        d.rounded_rectangle([x0-170,y0-20,x0+cw*9+150,y0+250],20,fill=(8,18,14))
        for i in range(9):
            ctext(d,y0,str(i+1),font(36),MUTE,1,x0+cw*i+cw/2)
        d.text((x0+cw*9+30,y0),"R",font=font(36),fill=YEL)
        for r,(nm,row) in enumerate([("AWAY",away),("HOME",home)]):
            y=y0+80+r*80; d.text((x0-150,y),nm,font=font(36),fill=WHITE)
            for i in range(n): ctext(d,y,str(row[i]),font(40),WHITE,1,x0+cw*i+cw/2)
            d.text((x0+cw*9+30,y),str(sum(row[:n])),font=font(40),fill=YEL)
        caption(d,"Each inning, BOTH teams bat once — 9 innings in a game",t*3)
    else:
        t=(tt-27)/3
        ctext(d,190,"Most runs after 9 innings",font(64),WHITE,ease(t*3))
        ctext(d,290,"WINS!",font(140),YEL,ease(t*3-0.4))
        ctext(d,500,"Balls & strikes  •  3 outs  •  9 innings  •  both teams hit",font(32,False),MUTE,ease(t*3-0.8))
    return im

p=subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-",
  "-c:v","libx264","-pix_fmt","yuv420p","-crf","20","-movflags","+faststart",sys.argv[1]],stdin=subprocess.PIPE)
for f in range(FPS*DUR):
    p.stdin.write(scene(f/FPS).tobytes())
p.stdin.close(); p.wait()
