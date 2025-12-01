import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Share, 
  Trophy, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Copy, 
  Twitter, 
  MessageCircle,
  Star,
  Award,
  Target,
  Zap,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  type: 'milestone' | 'streak' | 'profit' | 'portfolio' | 'trading';
  title: string;
  description: string;
  icon: JSX.Element;
  value: number;
  metric: string;
  achievedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isPublic: boolean;
}

interface SocialPost {
  id: string;
  achievementId: string;
  customMessage: string;
  privacyLevel: 'public' | 'friends' | 'private';
  showAmount: boolean;
  showPercentage: boolean;
  showPortfolioValue: boolean;
  createdAt: Date;
}

interface SocialSharingProps {
  userAchievements?: Achievement[];
  portfolioValue?: number;
  totalProfit?: number;
  profitPercentage?: number;
}

export default function SocialSharing({ 
  userAchievements = [],
  portfolioValue = 0,
  totalProfit = 0,
  profitPercentage = 0
}: SocialSharingProps) {
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareSettings, setShareSettings] = useState({
    privacyLevel: 'public' as 'public' | 'friends' | 'private',
    showAmount: false,
    showPercentage: true,
    showPortfolioValue: false,
    customMessage: ''
  });

  useEffect(() => {
    // Generate achievements based on user data
    const generatedAchievements = generateAchievements(portfolioValue, totalProfit, profitPercentage);
    setAchievements([...userAchievements, ...generatedAchievements]);
  }, [userAchievements, portfolioValue, totalProfit, profitPercentage]);

  const generateAchievements = (portfolio: number, profit: number, percentage: number): Achievement[] => {
    const achievements: Achievement[] = [];

    // Portfolio milestones
    if (portfolio >= 1000) {
      achievements.push({
        id: 'portfolio_1k',
        type: 'milestone',
        title: 'First Thousand',
        description: 'Reached $1,000 portfolio value',
        icon: <Trophy className="h-5 w-5" />,
        value: portfolio,
        metric: 'USD',
        achievedAt: new Date(),
        rarity: 'common',
        isPublic: true
      });
    }

    if (portfolio >= 10000) {
      achievements.push({
        id: 'portfolio_10k',
        type: 'milestone',
        title: 'Rising Star',
        description: 'Reached $10,000 portfolio value',
        icon: <Star className="h-5 w-5" />,
        value: portfolio,
        metric: 'USD',
        achievedAt: new Date(),
        rarity: 'rare',
        isPublic: true
      });
    }

    // Profit achievements
    if (percentage >= 10) {
      achievements.push({
        id: 'profit_10_percent',
        type: 'profit',
        title: 'Profit Master',
        description: 'Achieved 10%+ returns',
        icon: <TrendingUp className="h-5 w-5" />,
        value: percentage,
        metric: '%',
        achievedAt: new Date(),
        rarity: 'rare',
        isPublic: true
      });
    }

    if (percentage >= 50) {
      achievements.push({
        id: 'profit_50_percent',
        type: 'profit',
        title: 'DeFi Legend',
        description: 'Achieved 50%+ returns',
        icon: <Award className="h-5 w-5" />,
        value: percentage,
        metric: '%',
        achievedAt: new Date(),
        rarity: 'legendary',
        isPublic: true
      });
    }

    return achievements;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const generateShareContent = (achievement: Achievement) => {
    const baseMessage = `🎉 Just unlocked "${achievement.title}" on my DeFi journey!`;
    const details = [];
    
    if (shareSettings.showPercentage && achievement.type === 'profit') {
      details.push(`📈 ${achievement.value}${achievement.metric} returns`);
    }
    
    if (shareSettings.showAmount && achievement.type === 'milestone') {
      details.push(`💰 $${achievement.value.toLocaleString()} portfolio value`);
    }
    
    if (shareSettings.showPortfolioValue && portfolioValue > 0) {
      details.push(`🏦 Total portfolio: $${portfolioValue.toLocaleString()}`);
    }

    const customPart = shareSettings.customMessage ? `\n\n${shareSettings.customMessage}` : '';
    const detailsPart = details.length > 0 ? `\n${details.join('\n')}` : '';
    
    return `${baseMessage}${detailsPart}${customPart}\n\n#DeFi #CryptoAchievements #InvestmentGoals`;
  };

  const handleShare = async (platform: 'twitter' | 'copy' | 'general') => {
    if (!selectedAchievement) return;

    const content = generateShareContent(selectedAchievement);
    
    try {
      if (platform === 'copy') {
        await navigator.clipboard.writeText(content);
        toast({
          title: "Copied to Clipboard",
          description: "Share content copied successfully!",
        });
      } else if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
        window.open(twitterUrl, '_blank');
        toast({
          title: "Opening Twitter",
          description: "Share your achievement on Twitter!",
        });
      } else {
        if (navigator.share) {
          await navigator.share({
            title: selectedAchievement.title,
            text: content,
          });
          toast({
            title: "Shared Successfully",
            description: "Your achievement has been shared!",
          });
        } else {
          await navigator.clipboard.writeText(content);
          toast({
            title: "Copied to Clipboard",
            description: "Share content copied successfully!",
          });
        }
      }
      setShowShareDialog(false);
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share at this time",
        variant: "destructive",
      });
    }
  };

  const toggleAchievementPrivacy = (achievementId: string) => {
    setAchievements(prev => 
      prev.map(ach => 
        ach.id === achievementId 
          ? { ...ach, isPublic: !ach.isPublic }
          : ach
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share className="h-5 w-5 mr-2" />
            Investment Achievements
          </CardTitle>
          <CardDescription>
            Share your DeFi milestones and trading successes with privacy controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {achievements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start trading to unlock achievements!</p>
                <p className="text-sm">Complete your first transaction to earn your first badge.</p>
              </div>
            ) : (
              achievements.map((achievement) => (
                <Card key={achievement.id} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getRarityColor(achievement.rarity)}`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold flex items-center space-x-2">
                            {achievement.title}
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-lg font-bold text-green-600">
                              {achievement.value.toLocaleString()}{achievement.metric}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {achievement.achievedAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAchievementPrivacy(achievement.id)}
                          className="text-muted-foreground"
                        >
                          {achievement.isPublic ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAchievement(achievement);
                            setShowShareDialog(true);
                          }}
                          disabled={!achievement.isPublic}
                        >
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share className="h-5 w-5 mr-2" />
              Share Achievement
            </DialogTitle>
            <DialogDescription>
              Customize your share settings and privacy controls
            </DialogDescription>
          </DialogHeader>
          
          {selectedAchievement && (
            <div className="space-y-6">
              {/* Achievement Preview */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getRarityColor(selectedAchievement.rarity)}`}>
                      {selectedAchievement.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold">{selectedAchievement.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedAchievement.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Settings
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-percentage">Show percentage returns</Label>
                    <Switch
                      id="show-percentage"
                      checked={shareSettings.showPercentage}
                      onCheckedChange={(checked) => 
                        setShareSettings(prev => ({ ...prev, showPercentage: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-amount">Show dollar amounts</Label>
                    <Switch
                      id="show-amount"
                      checked={shareSettings.showAmount}
                      onCheckedChange={(checked) => 
                        setShareSettings(prev => ({ ...prev, showAmount: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-portfolio">Show total portfolio value</Label>
                    <Switch
                      id="show-portfolio"
                      checked={shareSettings.showPortfolioValue}
                      onCheckedChange={(checked) => 
                        setShareSettings(prev => ({ ...prev, showPortfolioValue: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="privacy-level">Visibility</Label>
                  <Select 
                    value={shareSettings.privacyLevel} 
                    onValueChange={(value: 'public' | 'friends' | 'private') => 
                      setShareSettings(prev => ({ ...prev, privacyLevel: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see</SelectItem>
                      <SelectItem value="friends">Friends only</SelectItem>
                      <SelectItem value="private">Private - Just me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-message">Custom message (optional)</Label>
                  <Textarea
                    id="custom-message"
                    placeholder="Add your own message..."
                    value={shareSettings.customMessage}
                    onChange={(e) => 
                      setShareSettings(prev => ({ ...prev, customMessage: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Share Preview</Label>
                <Card className="p-3 bg-muted/50">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {generateShareContent(selectedAchievement)}
                  </pre>
                </Card>
              </div>

              {/* Share Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare('copy')}
                  className="flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare('twitter')}
                  className="flex items-center space-x-2 text-blue-600"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </Button>
                <Button
                  onClick={() => handleShare('general')}
                  className="flex items-center space-x-2"
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}