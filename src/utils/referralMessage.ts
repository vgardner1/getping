import { getPublicProfileUrl, getShareableUrl } from "@/lib/environment";

interface ReferralMessageOptions {
  userId: string;
  isOnboarded?: boolean;
  includeProfileLink?: boolean;
}

export const generateReferralMessage = ({ 
  userId, 
  isOnboarded = true, 
  includeProfileLink = true 
}: ReferralMessageOptions): string => {
  const baseMessage = "I just started using this smart ring called ping! that lets me share my contact info instantly just by tapping it on phones.";
  
  const profileLink = includeProfileLink && isOnboarded 
    ? `\n\nCheck out my profile: ${getPublicProfileUrl(userId)}`
    : "";
  
  const referralUrl = getShareableUrl(`/signup?ref=${userId}`);
  const referralText = isOnboarded 
    ? "\n\nYou should lowkey get one too! If you use my referral link we both get 1 month free:"
    : "\n\nuse this link to sign up for yours:";
  
  return `${baseMessage}${profileLink}${referralText}\n${referralUrl}`;
};