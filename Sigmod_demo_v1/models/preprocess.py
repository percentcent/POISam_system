count = 0
fw = open('/Users/peishanlee/Downloads/tweet_Melbourne_subset.txt', 'w')

fw.write('tweet_id'+'\t'+'time'+'\t'+'text'+'\t'+'lat'+'\t'+'lon'+'\n')
for line in open("/Users/peishanlee/Downloads/tweet_GreatMelbourne.txt","r"):
	if(count%10 == 0):
		fw.write(line)
	count += 1

fw.close()