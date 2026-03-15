#  patterns generator
        
Je veux créer un outil web me permettant de générer automatiquement des motifs répétitifs de type marocain comme les zellige et zouaq en vectoriel pour sauver en .svg 
Role: Expert en développement Creative Coding et Géométrie Islamique Traditionnelle 
Objectif: Créer une application web interactive de génération de motifs Zellige et Zouaq marocains en format vectoriel 
L'outil doit reposer sur la méthode de construction Hasba 
Unité de base : Générer une cellule carrée ou hexagonale répétible 
Symétrie Radiale : Implémenter une fonction qui dessine une rosace basée sur n branches 
Entrelacement : Les lignes ne doivent pas juste se croiser elles doivent donner l'illusion de passer au-dessus et en-dessous 
Pavage : Répéter l'unité de base à l'infini sur le plan 
La Rosette : C'est le cœur du motif elle possède généralement 8 12 16 ou 24 branches 
La Symétrie : Les motifs utilisent des groupes de papier peint 
L'Entrelacement : Ce qui différencie un simple dessin d'un motif traditionnel c'est l'effet dessus-dessous des lignes 
Votre outil devrait fonctionner par couches 
A. Le Générateur de Tuile 
Définir le nombre de branches de l'étoile centrale 
Calculer les lignes de fuite qui rejoignent les bords de la cellule 
Appliquer des miroirs pour fermer les formes 
B. Le Système de Pavage 
Une fois la tuile générée répéter le bloc 
C. La Colorisation 
Zellige : Utilisez des palettes de couleurs terreuses ou émaillées traditionnelles 
Zouaq : Ajoutez des filtres pour simuler le relief de la peinture sur bois ou des gradients légers 
Les motifs sont basés sur des grilles de régulation 
Les couleurs pour le Zellige incluent 
Bleu de Fès 
Vert émeraude 
Jaune safran 
Terracotta 
Les motifs utilisent des symétries d'ordre 4 ou 6 
Les rosaces possèdent généralement 6 8 12 16 ou 24 branches

Made with Floot.

# Instructions

For security reasons, the `env.json` file is not pre-populated — you will need to generate or retrieve the values yourself.  

For **JWT secrets**, generate a value with:  

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste the generated value into the appropriate field.  

For the **Floot Database**, download your database content as a pg_dump from the cog icon in the database view (right pane -> data -> floot data base -> cog icon on the left of the name), upload it to your own PostgreSQL database, and then fill in the connection string value.  

**Note:** Floot OAuth will not work in self-hosted environments.  

For other external services, retrieve your API keys and fill in the corresponding values.  

Once everything is configured, you can build and start the service with:  

```
npm install -g pnpm
pnpm install
pnpm vite build
pnpm tsx server.ts
```
